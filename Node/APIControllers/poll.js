var pg = require('pg');

var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var poll = function() {};
poll.get = function(response, body, request, id) {
    var polls = [];
    
    pg.connect(connectionString, function(err, client, done) {
       if(err) {
            return console.error('error fetching client from pool', err);
        }
    
        var query = "SELECT json from pollDoc ";
        if (id !== null) {
            query += " where id = " + id;
        }
        query += " order by id desc LIMIT 100;";
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            polls = result.rows;
            
            response.writeHead("200", { "content-type": "application/json"});
            
            var pollArray = [];
            var itemsProcessed = 0;
            polls.forEach(function(pollItem) {
                var parsedPoll = JSON.parse(pollItem.json);
                pollArray.push(parsedPoll);
                itemsProcessed++;
                if (itemsProcessed === polls.length) {
                    poll.endGet(pollArray, response);
                }
            });
        });
    });
};

poll.endGet = function(polls, response) {
    var json = JSON.stringify(polls);
    response.write(json);
    response.end();
};

poll.post = function(response, body) {
    var json;
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (!body.question || typeof body.userId == 'undefined') {
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            if (body.question.length <= 140) {
                var timestamp = Date.now();
                var query = "INSERT into poll (question, ownerid, timestamp) values ('" + body.question.replace(/'/g, "''") + "'," + body.userId + "," + timestamp +") RETURNING id;";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    var newId = result.rows[0].id;
                    
                    var query = "select login, avatar from account where id = " + body.userId + ";";
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        response.writeHead("200", { "content-type": "application/json"});
                        
                        var avatar = result.rows[0].avatar;
                        var login = result.rows[0].login;
                        var newPoll = poll.createNewPollDoc(newId, body.question, body.userId, login, avatar, timestamp);
                        response.write(newPoll);
                        poll.insertNewPollDoc(newId, newPoll, client, done, function() {
                            response.end();   
                        });
                    });
                });
            } else {
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "Question too long, max 140 characters." });
                response.write(json);
                response.end();
            }
        });
    } else {
        response.writeHead("400", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 4, error: "Missing body" });
        response.write(json);
        response.end();
    }
};

poll.delete = function(response, body) {
    var json;
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.id != 'undefined' && typeof body.userId != 'undefined') {
                var query = "select 1 from poll where id = " + body.id + " and ownerId = " + body.userId + ";";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    if (result.rowCount === 0) {
                        response.writeHead("403", { "content-type": "application/json"});
                        return response.end();
                    }
                    
                    var query = "DELETE from poll where id = " + body.id + ";";
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        var query = "DELETE from vote where pollId = " + body.id + ";";
                        console.log("running query: " + query);
                        client.query(query, function(err, result) {
                            //call `done()` to release the client back to the pool 
                            done();
                            
                            if(err) {
                              return console.error('error running query', err);
                            }
                            
                            var query = "DELETE from pollDoc where id = " + body.id + ";";
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
                        });
                    });
                });
            } else {
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 2, error: "Id is missing" });
                response.write(json);
                response.end();
            }
        });
    } else {
        response.writeHead("400", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 4, error: "Missing body" });
        response.write(json);
        response.end();
    }
};

poll.createNewPollDoc = function(id, question, ownerId, login, avatar, timestamp) {
    var pollDoc = {
        id: id,
        question: question,
        ownerId: ownerId,
        login: login,
        avatar: avatar,
        timestamp: timestamp
    }
    
    return JSON.stringify(pollDoc);
};

poll.insertNewPollDoc = function(id, jsonPoll, client, done, callback) {
    var query = "INSERT INTO pollDoc (id, json) values(" + id + ",'" + jsonPoll.replace(/'/g, "''") + "');";
    console.log("running query: " + query);
    client.query(query, function(err, result) {
        //call `done()` to release the client back to the pool 
        done();
        
        if(err) {
          return console.error('error running query', err);
        }
        
        callback();
    });
};

poll.updatePollDoc = function(id, jsonPoll, client, done, callback) {
    var query = "UPDATE pollDoc SET json = '" + jsonPoll.replace(/'/g, "''") + "' where id = " + id + ";";
    console.log("running query: " + query);
    client.query(query, function(err, result) {
        //call `done()` to release the client back to the pool 
        done();
        
        if(err) {
          return console.error('error running query', err);
        }
        
        callback();
    });
};

poll.getPollDoc = function(id, client, done, callback) {
    var query = "select json from pollDoc where id = " + id + ";";
    console.log("running query: " + query);
    client.query(query, function(err, result) {
        //call `done()` to release the client back to the pool 
        done();
        
        if(err) {
          return console.error('error running query', err);
        }
        
        var pollDoc;
        
        if (result.rowCount > 0) {
            var json = result.rows[0].json;
            pollDoc = JSON.parse(json);
        }
        
        callback(pollDoc);
    });
};

module.exports = poll;