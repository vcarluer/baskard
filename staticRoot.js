"use strict";
var fs = require("fs");

var staticRoot = function () {};
var authorizedContentTypes = {
    css: "text/css; charset=utf-8",
    js: "text/javascript",
    png: "image/png",
    ico: "image/x-icon"
};


staticRoot.write = function (pathname, response) {
    var resource = pathname.slice(1);
    if (!resource) {
        response.writeHead("200", { "content-type": "text/html"});
        var fsPath = "polact.htm";
        var readStream = fs.createReadStream(fsPath);
        readStream.on('open', function () {
            readStream.pipe(response);
        });
        
        readStream.on('error', function(err) {
            response.end(err);
        });
    } else {
        fs.exists(resource, function(exists) {
            if (exists) {
                var extPos = resource.lastIndexOf(".");
                if (extPos) {
                    var ext = resource.substr(extPos + 1);
                    if (ext && authorizedContentTypes[ext]) {
                        // todo: secure node js files
                        response.writeHead("200", { "content-type": authorizedContentTypes[ext]});
                        var readStream = fs.createReadStream(resource);
                        readStream.on('open', function () {
                            readStream.pipe(response);
                        });
                        
                        readStream.on('error', function(err) {
                            response.end(err);
                        });
                    } else {
                        response.writeHead("403");
                        response.end();
                    }
                } else {
                    response.writeHead("403");
                    response.end();
                }
            } else {
                response.writeHead("404");
                response.end();
            }
        });
    }
};

module.exports = staticRoot;