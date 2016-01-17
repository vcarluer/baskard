var controllers = {};
controllers.poll = require("./APIControllers/poll.js");
controllers.vote = require("./APIControllers/vote.js");
var url = require("url");

var api = function() {};
api.root = "/api"
api.route = function(request, response) {
    var requestUrl = url.parse(request.url);
    var controllerName = requestUrl.pathname.slice(api.root.length + 1);
    var controller = controllers[controllerName]
    if (controller) {
        var method = request.method.toLocaleLowerCase();
         if (controller[method]) {
            var body = "";
            request.on('data', function (chunk) {
                body += chunk;
            });
            request.on('end', function () {
                var bodyObject;
                if (body) {
                    bodyObject = JSON.parse(body);
                }
                
                if (requestUrl.query) {
                    // need to parse query string
                    bodyObject = { userId: 0 };
                }
                
                controller[method](response, bodyObject);
            });
        }
    }
};

module.exports = api;