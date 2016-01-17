/*global reqwest*/
"use strict";
function ready(fn) {
  if (document.readyState === 'complete'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {
    poll.bind();
    
   reqwest({
       url: "/api/poll",
       method: "GET",
       success: function (resp) {
           var fist = resp[0];
           poll.render(fist);
       },
       error: function(resp) {
           console.log(resp);
       }
   });
   
   
});