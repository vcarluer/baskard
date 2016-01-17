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
  account.render();
  poll.bind();
  poll.refresh();
});