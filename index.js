var http = require("http");
var url = require("url");
var staticRoot = require("./staticRoot.js");
var api = require("./api.js");

http.createServer(function(request, response) {
    var requestUrl = url.parse(request.url);
    if (requestUrl.pathname.substr(0, api.root.length) === api.root) {
         api.route(request, response);
    } else {
        staticRoot.write(requestUrl.pathname, response);
    }
   
}).listen(process.env.PORT || 80);
console.log("Server is listening on " + process.env.PORT || 80);