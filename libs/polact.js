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
    poll.refresh();
});