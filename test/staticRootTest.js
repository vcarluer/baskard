var chai = require("chai");
var expect = chai.expect;

var server = require("../Node/server.js");
var serverTest = require("./serverTest.js");
var fs = require("fs");

describe("staticRoot", function() {
    before(function() {
       server.listen(8000); 
    });
    
    after(function() {
        server.close();
    });
    
    it ("streams polact.htm if no resources", function(done) {
        fs.readFile("Views/polact.htm", "utf8", (err, data) => {
            serverTest.test(done, "", 200, data);
        });
    });
});