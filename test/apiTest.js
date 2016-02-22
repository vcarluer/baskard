var server = require("../Node/server.js");
var serverTest = require("./serverTest.js");

describe("api", function() {
    before(function() {
       server.listen(8000); 
    });
    
    after(function() {
        server.close();
    });
    
    it ("responds 404 if no api", function(done) {
        serverTest.test(null, "/api", 404);
        serverTest.test(done, "/api/none", 404);
    });
    
    it ("responds 404 if no api method", function(done) {
        serverTest.test(done, "/api/vote", 404);
    });
    
    
});