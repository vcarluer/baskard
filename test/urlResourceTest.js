var chai = require("chai");
var expect = chai.expect;
var urlResource = require("../Node/urlResource.js");

describe("urlResource", function() {
   it ("should returns a zero length array if no path", function() {
       expect(urlResource.parse("")).to.be.empty;
   });
   
   it ("should returns a zero length array if path is /", function() {
       expect(urlResource.parse("/")).to.be.empty;
   });
   
   it ("should returns api if first resource", function() {
      expect(urlResource.parse("/api/toto")[0]).to.equals("api"); 
   });
   
   it ("should returns all the given resources", function() {
      var resources = urlResource.parse("/res1/res2/res3/res4");
      expect(resources[0]).to.equals("res1");
      expect(resources[1]).to.equals("res2");
      expect(resources[2]).to.equals("res3");
      expect(resources[3]).to.equals("res4");
      expect(resources.length).to.equals(4);
   });
   
   it ("should returns all the given resources and proper length wifth / at the end", function() {
      var resources = urlResource.parse("/res1/res2/res3/res4/");
      expect(resources[0]).to.equals("res1");
      expect(resources[1]).to.equals("res2");
      expect(resources[2]).to.equals("res3");
      expect(resources[3]).to.equals("res4");
      expect(resources.length).to.equals(4);
   });
});