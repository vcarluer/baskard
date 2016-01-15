"use strict";
var controllers = {};
controllers.poll = require("./APIControllers/poll.js");
var url = require("url");

var api = function() {};
api.route = function(request, response) {
    var requestUrl = url.parse(request.url);
    var controllerName = requestUrl.pathname.slice(1);
    var controller = controllers[controllerName]
    if (controller) {
        var method = request.method.toLocaleLowerCase();
         if (controller[method]) {
            controller[method](response);
        }
    }
    if (requestUrl.pathname === "/poll") {
       
    }
};

module.exports = api;