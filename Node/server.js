var http = require("http");
var route = require("./route.js");
var server = http.createServer(function(request, response) {
    route.go(request, response);
    return;
});

module.exports = server;