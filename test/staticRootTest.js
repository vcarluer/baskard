var chai = require("chai");
var expect = chai.expect;

var server = require("../Node/server.js");
var serverTest = require("./serverTest.js");

describe("staticRoot", function() {
    before(function() {
       server.listen(8000); 
    });
    
    after(function() {
        server.close();
    });
    
    it ("streams polact.htm if no resources", function(done) {
        serverTest.test(done, "",200,null,function(res, data) {
            expect(data.slice(0,15)).to.equal("<!doctype html>");
        });
    });
});