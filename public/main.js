 
var trash = document.getElementsByClassName("fa-trash-o");
var thumbUp = document.getElementsByClassName("fa-seedling");

Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.getAttribute('data-id')
        const thumbUp = Number(this.parentNode.parentNode.children[0].innerText)
     
        

        fetch('messages', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'id': id,
            'thumbUp':thumbUp
        
      
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.getAttribute('data-id')
        const img = this.getAttribute('data-img')
      
        console.log(img);
      
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'id': id,
            'img':img
           
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});

Array.from(thumbUp).forEach(function(element) {
  element.addEventListener('click', function(){
    const id = this.parentNode.parentNode.getAttribute('data-id')
    const thumbUp = Number(this.parentNode.parentNode.innerText)
    fetch('thumbUpFeed', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'id': id,
        'thumbUp':thumbUp
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});