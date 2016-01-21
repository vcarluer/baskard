var pg = require('pg');

var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var tag = function() {};
tag.get = function(response, body, request, id) {
    pg.connect(connectionString, function(err, client, done) {
       if(err) {
            return console.error('error fetching client from pool', err);
        }
    
        var query = "SELECT tag from tag LIMIT 10 ";
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
                response.writeHead("500", { "content-type": "application/json"});
                return console.error('error running query', err);
            }
            
            var tags = [];
            if (result.rowCount === 0) {
                response.writeHead("200", { "content-type": "application/json"});
                var json = JSON.stringify(tags);
                response.write(json);
                response.end();
            } else {
                var parsed = 0;
                result.rows.forEach(function(tag) {
                    tags.push(tag.tag);
                    parsed++;
                    if (parsed === result.rows.length) {
                        response.writeHead("200", { "content-type": "application/json"});
                        var json = JSON.stringify(tags);
                        response.write(json);
                        response.end();
                    }
                });
            }
            
        });
    });
};

module.exports = tag;