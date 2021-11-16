var mongoose = require('mongoose');

module.exports = function(app, passport, db, multer) {


// MULTER ===============================================================
  var storage = multer.diskStorage({
   
    destination: (req, file, cb) => {
      console.log(req)
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  var upload = multer({storage: storage}); 
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });
    
 // FEED SECTION =========================
    app.get('/feed', isLoggedIn, function(req, res) {
      db.collection('messages').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('feed.ejs', {
          user : req.user,
          messages: result
        })
      })
  });

  // PAGE =============================
  app.get('/page/:id', isLoggedIn, function (req, res) {
    let params = req.params.id;
    let id = new mongoose.Types.ObjectId(params);
    db.collection('messages')
      .find({ posterId: id })
      .toArray((err, result) => {
        console.log(result);
        if (err) return console.log(err);
        res.render('page.ejs', {
          user: req.user,
          messages: result,
        });
      });
  });
  // POST =============================
  app.get('/post/:id', isLoggedIn, function (req, res) {
    let params = req.params.id;
    console.log('params', params);
    let id = new mongoose.Types.ObjectId(params);
    db.collection('messages')
      .find({ _id: id })
      .toArray((err, messageResult) => {
        if (err) return console.log(err);
        db.collection('comments')
        .find({postId : id})
        .toArray((err, commentsResult) => {
          if (err) return console.log(err);
  
          res.render('post.ejs', {
            user: req.user,
            messages: messageResult,
            comments:commentsResult
          });
        });

        // res.render('post.ejs', {
        //   user: req.user,
        //   messages: result,
        // });
      });
  });
  // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', upload.single('uploadedFile'),  (req, res) => {
      // let user = req.user.local.email
      let posterId = req.user._id;
      let postedBy = req.user.local.email;
      // console.log( req.file)
      db.collection('messages').save({
        name: req.body.name, 
        msg: req.body.msg, 
        img:req.file.filename,
        thumbUp: 0, 
        thumbDown:0,
        posterId: new mongoose.Types.ObjectId(posterId),
        postedBy: postedBy,
      }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })
// post comments===============================================================

    app.post('/comment', (req, res) => {
      // let user = req.user.local.email
      let posterId = req.user._id;
      let postedBy = req.user.local.email;
      let postId = req.body.postId
      console.log('request' , req.body)
      console.log('postId', postId)
      db.collection('comments').save({
        comment: req.body.comment,
        posterId: new mongoose.Types.ObjectId(posterId),
        postId: new mongoose.Types.ObjectId(postId),
        postedBy: postedBy,
      }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect(`/post/${postId}`)
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/messagesDown', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
