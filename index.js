var http = require("http");
var fs = require("fs");
http.createServer(function(request, response) {
    response.writeHead("200", { "content-type": "text/html"});
    var fsPath = "polact.htm";
    response.writeHead(200);
    var readStream = fs.createReadStream(fsPath);
    readStream.on('open', function () {
    readStream.pipe(response);
    });
    
    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        response.end(err);
    });
}).listen(process.env.PORT || 80);
console.log("Server is listening on " + process.env.PORT || 80);