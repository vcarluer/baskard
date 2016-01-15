var http = require("http");
http.createServer(function(request, response) {
    response.writeHead("200", { "content-type": "text/html"});
    response.write("<!DOCTYPE html>");
    response.write("<html>");
    response.write("<head>");
    response.write("<title>Hello World Page</title>");
    response.write("</head>");
    response.write("<body>");
    response.write("Hello World!");
    response.write("</body>");
    response.write("</html>");
    response.end();
}).listen(80); // process.env.PORT, process.env.IP
console.log("Server is listening on " + 80); // process.env.IP + ":" + process.env.PORT