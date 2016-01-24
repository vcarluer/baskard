var http = require("http");
var url = require("url");
var staticRoot = require("./Node/staticRoot.js");
var api = require("./Node/api.js");
var fs=require("fs");
var buffer=require("buffer");
var pg = require('pg');
var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"

http.createServer(function(request, response) {
    var requestUrl = url.parse(request.url);
    if (requestUrl.pathname.substr(0, api.root.length) === api.root) {
         api.route(request, response);
    } else {
        if (requestUrl.pathname === "/test") {
            if (request.method === "GET") {
                pg.connect(connectionString, function(err, client, done) {
                       if(err) {
                            return console.error('error fetching client from pool', err);
                        }
                    
                        var query = "select * from test";
                        client.query(query, function(err, result) {
                            //call `done()` to release the client back to the pool 
                            done();
                            
                            if(err) {
                              return console.error('error running query', err);
                            }
                            
                             response.writeHead("200", { "content-type": "image/png"});
                             
                             
                             var input = result.rows[0].file;
                             fs.writeFile('de.jpg', input, function (err) {
                                  if (err) return console.log(err);
                              console.log('file in de.jpg');
                            });
                             
                             response.write(input);
                             response.end();
                        });
                     });
                     
                     return;
            }
            
            
            var fileSize = request.headers['content-length'];
            console.log("file size: " + fileSize);
             var uploadedBytes = 0 ;
            var body;
            
            request.on('data',function(d){
                if (!body) {
                    body = d;
                } else {
                    body = Uint8ArrayConcat(body, d);
                }
                
             uploadedBytes += d.length;
             var p = (uploadedBytes/fileSize) * 100;
             console.log("Uploading " + parseInt(p)+ " %\n");
             
            });
             
            request.on('end',function(){
                if (body) {
                    var buf = new Buffer(body);
                    fs.writeFile('un.jpg', new Buffer(body), function (err) {
                      if (err) return console.log(err);
                      console.log('file in un.jpg');
                    });
                    
                     pg.connect(connectionString, function(err, client, done) {
                       if(err) {
                            return console.error('error fetching client from pool', err);
                        }
                        
                        var query = "INSERT into test(file) values($1);";
                        client.query(query, [buf], function(err, result) {
                            //call `done()` to release the client back to the pool 
                            done();
                            
                            if(err) {
                              return console.error('error running query', err);
                            }
                        });
                     });
                }
             response.end("File Upload Complete");
             });
        } else {
            staticRoot.write(requestUrl.pathname, response);
        }
        
    }
   
}).listen(process.env.PORT || 80);
console.log("Server is listening on " + process.env.PORT || 80);

function Uint8ArrayConcat(first, second)
{
    var firstLength = first.length,
        result = new Uint8Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}

function parseBytea (input) {
  if (/^\\x/.test(input)) {
    // new 'hex' style response (pg >9.0)
    return new Buffer(input.substr(2), 'hex')
  }
  var output = ''
  var i = 0
  while (i < input.length) {
    if (input[i] !== '\\') {
      output += input[i]
      ++i
    } else {
      if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
        output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8))
        i += 4
      } else {
        var backslashes = 1
        while (i + backslashes < input.length && input[i + backslashes] === '\\') {
          backslashes++
        }
        for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
          output += '\\'
        }
        i += Math.floor(backslashes / 2) * 2
      }
    }
  }
  return new Buffer(output, 'binary')
};