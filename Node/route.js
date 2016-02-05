var api = require("./api.js");
var staticRoot = require("./staticRoot.js");
var url = require("url");
var urlResource = require("./urlResource.js");

var route = function() {};

route.isApiRoute = function(path) {
    var resources = urlResource.parse(path);
    return (resources.length > 0 && resources[0] === api.root);
};

route.getController = function(path) {
  if (this.isApiRoute(path)) {
      return api;
  } else {
      return staticRoot;
  }
};

route.go = function(request, response) {
    var requestUrl = url.parse(request.url);
    this.getController(requestUrl.pathname).route(request, response); 
};

module.exports = route;