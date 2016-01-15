"use strict";
var fs = require("fs");

var staticRoot = function () {};

staticRoot.write = function (response) {
    response.writeHead("200", { "content-type": "text/html"});
    var fsPath = "polact.htm";
    var readStream = fs.createReadStream(fsPath);
    readStream.on('open', function () {
        readStream.pipe(response);
    });
    
    readStream.on('error', function(err) {
        response.end(err);
    });
};

module.exports = staticRoot;