 
var like = document.getElementsByClassName("fa-seedling");
console.log('object');

Array.from(like).forEach(function(element) {
      element.addEventListener('click', function(){
        const id = this.parentNode.parentNode.getAttribute('data-id')
        const thumbUp = Number(this.parentNode.parentNode.children[3].innerText)
        console.log(id, thumbUp);
        

        fetch('../messages', {
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
     
          window.location.reload(true)
        })
      });
});