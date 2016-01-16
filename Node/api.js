"use strict";
var controllers = {};
controllers.poll = require("./APIControllers/poll.js");
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
            controller[method](response);
        }
    }
};

module.exports = api;