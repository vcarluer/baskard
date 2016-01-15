var http = require("http");
var url = require("url");
var staticRoot = require("./staticRoot.js");
var api = require("./api.js");

http.createServer(function(request, response) {
    var requestUrl = url.parse(request.url);
    if (requestUrl.pathname === "/") {
        staticRoot.write(response);
    } else {
        api.route(request, response);
    }
   
}).listen(process.env.PORT || 80);
console.log("Server is listening on " + process.env.PORT || 80);