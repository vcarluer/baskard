/*global reqwest*/
"use strict";
function ready(fn) {
  if (document.readyState === 'complete'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

var user = {
  id: 0
};

ready(function() {
    if (localStorage.userId) {
      user.id = localStorage.userId;
    }
    
    document.getElementById("userId").value = user.id;
    
    document.getElementById("login").onclick = function () {
      var userId = document.getElementById("userId").value;
      localStorage.userId = userId;
      document.location.reload();
    }
    
    
    poll.bind();
    poll.refresh();
});