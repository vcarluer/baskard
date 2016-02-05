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
    
    it ("responds 200 - read polact.htm if no resources", function(done) {
        fs.readFile("Views/polact.htm", "utf8", (err, data) => {
            serverTest.test(done, "", 200, data);
        });
    });
    
    it ("responds 200 - read polact.htm if /poll", function(done) {
        fs.readFile("Views/polact.htm", "utf8", (err, data) => {
            serverTest.test(done, "/poll", 200, data);
        });
    });
    
    it ("responds 404 if unknown", function(done) {
        serverTest.test(done, "/nimp", 404);
    });
    
    it ("responds 403 if unauthorized", function(done) {
        serverTest.test(null, "/index.js", 403);
        serverTest.test(null, "/Node/api.js", 403);
        serverTest.test(null, "/node_modules/chai/chai.js", 403);
        serverTest.test(null, "/test/routeTest.js", 403);
        serverTest.test(done, "/Views/polact.htm", 403);
    });
    
    it ("responds 200 for controllers", function(done) {
        serverTest.test(done, "/Controllers/account.js", 200); 
    });
    
    it ("responds 200 for libs", function(done) {
        serverTest.test(done, "/libs/reqwest.js", 200); 
    });
    
    it ("responds 200 for css", function(done) {
        serverTest.test(done, "/css/main.css", 200); 
    });
});