// server.js

// set up ======================================================================
// get all the tools we need // everything that we are requiring are dependencies 
const express  = require('express'); //declaring express and setting value to function require with passed argument of express
const app      = express();//declaring a variable that references the method express.
const port     = process.env.PORT || 8000; //declaring port variable and setting value to read port in env or go to 8080??? 
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose'); //declaring mongoose and setting value to function require with passed argument of mongoose dependency (It is like a an Object Relational Mapper (ORM). It helps us to enforce a specific schema )
const passport = require('passport');//declaring passport and setting value to require passport dependency (for authentication) 
const flash = require('connect-flash');//declaring flash and setting value to require connect-flash dependency 

const morgan       = require('morgan');//declaring morgan and setting value to requiring morgan dependency (loga http request and error messages)
const cookieParser = require('cookie-parser');//declaring cookieParser and setting value to requiring cookie-parser dependency (populates req.cookies with object keyed by cookie names)
const bodyParser   = require('body-parser');//not commonly used anymore, used to parse...body of code?? idkkk man. deprecated
const session      = require('express-session');//declaring session and setting value to requiring express-session dependency (store session serverside)
const configDB = require('./config/database.js');//(declaring configDB and setting value to requiring ./config/database.js dependency (loading configuration))
//everything has to be 'let', not 'const'. 
const multer  = require('multer')
let db 



// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {//mongoose.connect method with passed argument of function of url value in configDB
  //config is the path that is being passed to url
  if (err) return console.log(err)//console log if there is an error
  db = database //...databaaaase?
  require('./app/routes.js')(app, passport, db, multer); //so this is the line that is require 
}); // connect to our database

require('./config/passport')(passport); // pass passport (authentication) for configuration

// MIDDLEWARES: set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));//
app.use(express.static('public'))//allows us to publicly show 


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b', //session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
