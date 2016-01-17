var pg = require('pg');

var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var account = function() {};

account.get = function(response, body, request) {
    var login = request.headers["x-login"];
    var password = request.headers["x-password"];
    
    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        
        var json;
        var query = "select * from account where login = '" + login.replace(/'/g, "''") + "';";
        console.log("running query: " + query);
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            if (result.rowCount === 0) {
                response.writeHead("401", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 6, error: "No such login." });
                response.write(json);
                return response.end();
            }
            
            var userAccount = result.rows[0];
            if (userAccount.password !== password) {
                response.writeHead("401", { "content-type": "application/json"});
                 json = JSON.stringify({ errorCode: 6, error: "Bad password." });
                response.write(json);
                return response.end();
            }
            
            response.writeHead("200", { "content-type": "application/json"});
            json = JSON.stringify({ id: userAccount.id, login: userAccount.login, secret: userAccount.secret });
            response.write(json);
            return response.end();    
        });
    });
}

account.post = function(response, body) {
    var json;
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.login == 'undefined' ||
                typeof body.password == 'undefined'){
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            if (!body.password) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "Password cannot be null." });
                response.write(json);
                return response.end();
            }
            
            var query = "select 1 from account where login = '" + body.login.replace(/'/g, "''") + "';";
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
                
                if (result.rowCount !== 0) {
                    response.writeHead("403", { "content-type": "application/json"});
                    json = JSON.stringify({ errorCode: 1, error: "Login already exists." });
                    response.write(json);
                    return response.end();
                }
                
                // Compute secret here
                var secret = body.login + "_secret";
                query = "INSERT into account (login, password, secret) values('" + body.login.replace(/'/g, "''") + "','" + body.password.replace(/'/g, "''") + "','" + secret.replace(/'/g, "''") + "');";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    query = "select id, login, secret from account where login = '" + body.login.replace(/'/g, "''") + "';";
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        response.writeHead("200", { "content-type": "application/json"});
                        json = JSON.stringify(result.rows[0]);
                        response.write(json);
                        return response.end();    
                    });
                });
            });
        });
    } else {
        response.writeHead("400", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 4, error: "Missing body" });
        response.write(json);
        return response.end();
    }
};

account.getIdBySecret = function(secret, callback) {
    if (!secret || secret === "undefined") callback();
    
    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        
        var query = "select id from account where secret = '" + secret.replace(/'/g, "''") + "';";
        console.log("running query: " + query);
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            var id;
            
            if (result.rowCount === 1) {
                id = result.rows[0].id;
            }
            
            callback(id);
        });
    });
};

module.exports = account;