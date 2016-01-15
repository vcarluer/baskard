"use strict";
var poll = function() {};
poll.get = function(response) {
    response.writeHead("200", { "content-type": "application/json"});
    response.write("{ poll: 'prochain jdr' }");
    response.end();
};
module.exports = poll;