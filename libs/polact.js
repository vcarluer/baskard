/*global reqwest*/
function ready(fn) {
  if (document.readyState === 'complete'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {
   reqwest({
       url: "/api/poll",
       method: "GET",
       success: function (resp) {
           poll.render(resp);
       }
   });
});