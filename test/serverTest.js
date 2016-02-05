var chai = require("chai");
var expect = chai.expect;

var server = require("../Node/server.js");
var http = require("http");

var serverTest = function() {};
serverTest.test = function(done, path, expectedStatus, expectedBody, expectedCustom) {
    var url = "http://" + process.env.IP + ":8000" + path;
    http.get(url, function(res) {
       expect(res.statusCode).to.equal(expectedStatus);
       
       if (expectedBody) {
           var data = "";
           
           res.on("data", function(chunk) {
              data += chunk; 
           });
           
           res.on("end", function() {
               if (expectedCustom) {
                   expectedCustom(res, data);
               } else {
                expect(data).to.equal(expectedBody);
                if (done) {
                    done();    
                }
                
               }
           })    
       } else {
        if (done) {
            done();    
           }
        }
    });
};

module.exports = serverTest;