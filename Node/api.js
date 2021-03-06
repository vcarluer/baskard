var controllers = {};
controllers.accountpwl = require("./APIControllers/accountpwl.js");
controllers.poll = require("./APIControllers/poll.js");
controllers.vote = require("./APIControllers/vote.js");
controllers.tag = require("./APIControllers/tag.js");

var url = require("url");
var urlResource = require("./urlResource");

var api = function() {};
api.root = "api"
api.route = function(request, response) {
    var requestUrl = url.parse(request.url);
    var resources = urlResource.parse(requestUrl.pathname);
    
    var controllerName;
    var resourceId = null;
    if (resources.length > 1) {
        controllerName = resources[1];
        if (resources.length > 1) {
            resourceId = resources[2];
        }
    }
    
    var controller;
    if (controllerName) {
        controller = controllers[controllerName]
    }
    
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
                } else {
                    bodyObject = {};
                }
                
                bodyObject.userId = null;
                var unauthorized = true;
                
                if (controllerName === "accountpwl" && method !== "patch") {
                    controller[method](response, bodyObject, request, resourceId);
                } else {
                    if (request.headers["x-authentication"] && request.headers["x-authentication"] != "undefined") {
                        controllers.accountpwl.getIdBySecret(request, request.headers["x-authentication"], function(id) {
                            bodyObject.userId = id;    
                            if (!bodyObject.userId) {
                                response.writeHead("401", { "content-type": "application/json"});
                                var json = JSON.stringify({ errorCode: 66, error: "You must be logged." });
                                response.write(json);
                                return response.end();
                            }
                            
                            controller[method](response, bodyObject, request, resourceId);
                        });
                    } else {
                        if ((controllerName === "poll" || controllerName === "tag") && method === "get") {
                            // Authorized fallback in anonymous to list poll
                            bodyObject.userId = -1;
                            controller[method](response, bodyObject, request, resourceId);
                        } else {
                            response.writeHead("401", { "content-type": "application/json"});
                            var json = JSON.stringify({ errorCode: 66, error: "You must be logged." });
                            response.write(json);
                            return response.end();    
                        }
                    }
                }
            });
        } else {
            response.writeHead("404");
            response.end();
        }
    } else {
        response.writeHead("404");
        response.end();
    }
};

module.exports = api;