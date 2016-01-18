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
  account.bind();
  poll.bind();
  
  var token = getParameterByName("token");
  if (token) {
    account.login(token);
  } else {
    account.render();
    
    var path = window.location.pathname;
    var pollId;
    if (path) {
      var paths = path.slice(1).split(/\//);
      if (paths.length === 2 && paths[0] === "poll") {
        pollId = paths[1];      
      }
    }
    
    poll.refresh(pollId);
  }
  
});