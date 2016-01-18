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
    poll.refresh();  
  }
  
});