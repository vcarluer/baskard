var chai = require("chai");
var expect = chai.expect;
var api = require("../Node/api.js");
var staticRoot = require("../Node/staticRoot.js");
var route = require("../Node/route.js");
var http = require("http");

describe("Route", function() {
   it ("should recognize api root path", function() {
       expect(route.isApiRoute("/" + api.root)).to.equal(true);
   });
   
   it ("should recognize api path", function() {
       expect(route.isApiRoute(api.root + "/poll")).to.equal(true);
   });
   
   it ("should recognize a non api path", function() {
       expect(route.isApiRoute("/test")).to.equal(false);
   });
   
   it ("should not recognize /apitest as an api route", function() {
      expect(route.isApiRoute(api.root + "test")).to.equal(false); 
   });
   
   it ("should give the api handler if api path", function() {
      expect(route.getController(api.root)).to.equal(api); 
   });
   
   it ("should give the static file handler if not api path", function() {
      expect(route.getController("/test")).to.equal(staticRoot); 
   });
   
   it ("controllers should define route function", function() {
      expect(api).itself.to.respondTo("route");
      expect(staticRoot).itself.to.respondTo("route");
   });
   
   it ("should define an handle request / response function to handle server requests", function() {
      expect(route).itself.to.respondTo("go");
   });
});