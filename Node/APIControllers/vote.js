var pg = require('pg');

var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var vote = function() {};
vote.post = function(response, body) {
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.pollId == 'undefined' || 
                    typeof body.userId == 'undefined' || 
                    (typeof body.yes == 'undefined' && typeof body.no == 'undefined')){
                response.writeHead("400", { "content-type": "application/json"});
                var json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            if (body.yes && body.no) {
                response.writeHead("400", { "content-type": "application/json"});
                var json = JSON.stringify({ errorCode: 6, error: "You cannot vote yes and no at the same time!" });
                response.write(json);
                return response.end();
            }
            
            // type boolean
            if (!body.yes) body.yes = false;
            if (!body.no) body.no = false;
                
            var query = "select 1 from vote where pollId = " + body.pollId + " and userId = " + body.userId + ";";
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
                
                if (result.rowCount === 0) {
                    query = "insert into vote (pollId, userId, yes, no) values (" + body.pollId + "," + body.userId + "," + body.yes + "," + body.no + ");";
                } else {
                    query = "update vote set yes = " + body.yes + ", no = " + body.no + " where pollId = " + body.pollId + " and userId = " + body.userId + ";";
                }
                
                if (query) {
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        updatePollCounters(response, body, client, done);
                    });
                }
            });
        });
    } else {
        response.writeHead("400", { "content-type": "application/json"});
        var json = JSON.stringify({ errorCode: 4, error: "Missing body" });
        response.write(json);
        return response.end();
    }
};

// Delete here need body.pollId and body.pollId too to get update counters
vote.delete = function(response, body) {
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.pollId == 'undefined' || typeof body.userId == 'undefined'){
                response.writeHead("400", { "content-type": "application/json"});
                var json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            var query = "DELETE from vote where pollId = " + body.pollId + " and userId = " + body.userId + ";";
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
                
                updatePollCounters(response, body, client, done);
            });
        });
    }
};

function updatePollCounters(response, body, client, done) {
    // update poll counters
    var query;
    query = "update poll set " + 
            "yes = (select count(*) from vote where yes = true and pollId = " + body.pollId + ")," +
            "no =  (select count(*) from vote where no = true and pollId = " + body.pollId + ") " +
            "where id = " + body.pollId + ";";
    
    console.log("running query: " + query);
    client.query(query, function(err, result) {
        //call `done()` to release the client back to the pool 
        done();
        
        if(err) {
          return console.error('error running query', err);
        }
        
        client.query('SELECT id, question, yes, no FROM poll where id = ' + body.pollId + ';', function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            var poll;
            if (result.rowCount === 1) {
                poll = result.rows[0];
            }
            response.writeHead("200", { "content-type": "application/json"});
            
            var json = JSON.stringify(poll);
            response.write(json);
            return response.end();
        });
    });
}

module.exports = vote;