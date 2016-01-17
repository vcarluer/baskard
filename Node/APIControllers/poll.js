var pg = require('pg');

var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var poll = function() {};
poll.get = function(response) {
    var polls = [];
    
    pg.connect(connectionString, function(err, client, done) {
       if(err) {
            return console.error('error fetching client from pool', err);
        }
    
        client.query('SELECT question, yes, no FROM poll LIMIT 100;', function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            polls = result.rows;
            
            response.writeHead("200", { "content-type": "application/json"});
            
            var json = JSON.stringify(polls);
            response.write(json);
            response.end();
        });
    });
};

poll.post = function(response, body) {
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (body.question.length <= 140) {
                var query = "INSERT into poll (question, yes, no, ownerid) values ('" + body.question.replace(/'/g, "''") + "', 0, 0, 0);";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    response.writeHead("200", { "content-type": "application/json"});
                    var newPoll = {
                        question: body.question,
                        yes: 0,
                        no: 0
                    };
                    
                    response.write(JSON.stringify(newPoll));
                    response.end();
                });
            } else {
                response.writeHead("400", { "content-type": "application/json"});
                var json = JSON.stringify({ errorCode: 1, error: "Question too long, max 140 characters." });
                response.write(json);
                response.end();
            }
        });
    }
};

poll.delete = function(response, body) {
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.id != 'undefined') {
                var query = "DELETE from poll where id = " + body.id + ";";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    response.writeHead("200", { "content-type": "application/json"});
                    response.end();
                });
            } else {
                response.writeHead("400", { "content-type": "application/json"});
                var json = JSON.stringify({ errorCode: 2, error: "Id is missing" });
                response.write(json);
                response.end();
            }
        });
    }
};

module.exports = poll;