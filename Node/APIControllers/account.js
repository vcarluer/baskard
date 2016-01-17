var pg = require('pg');
var passphrase = "cette application rox du poney";
const crypto = require("crypto");

// todo: Read connection string from uncommited file
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
            
            getSecret(request, userAccount.id.toString(), login, function(secret) {
                if (secret) {
                    response.writeHead("200", { "content-type": "application/json"});
                    json = JSON.stringify({ id: userAccount.id, login: userAccount.login, secret: secret });
                    response.write(json);
                    return response.end();    
                } else {
                    response.writeHead("500", { "content-type": "application/json"});
                    return response.end();
                }
            });
        });
    });
}

account.post = function(response, body, request) {
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
            
            if (!body.login || body.login.length > 32) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "Login cannot be null and longer than 32." });
                response.write(json);
                return response.end();
            }
            
            if (!body.password || body.password.length > 32) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "Password cannot be null and longer than 32." });
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
                
                query = "INSERT into account (login, password) values('" + body.login.replace(/'/g, "''") + "','" + body.password.replace(/'/g, "''") + "');";
                console.log("running query: " + query);
                client.query(query, function(err, result) {
                    //call `done()` to release the client back to the pool 
                    done();
                    
                    if(err) {
                      return console.error('error running query', err);
                    }
                    
                    var query = "select id from account where login = '" + body.login.replace(/'/g, "''") + "';";
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        getSecret(request, result.rows[0].id.toString(), body.login, function(secret) {
                            if (secret) {
                                response.writeHead("200", { "content-type": "application/json"});
                                json = JSON.stringify({ id: result.rows[0].id, login: body.login, secret: secret });
                                response.write(json);
                                return response.end();
                            } else {
                                response.writeHead("500", { "content-type": "application/json"});
                                return response.end();
                            }
                        });
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

account.getIdBySecret = function(request, secret, callback) {
    if (!secret || secret === "undefined") {
        return callback();
    }
    
    decryptAndTestSecret(request, secret, function(secretAccount) {
        if (secretAccount) {
            callback(secretAccount.id);
        } else {
            callback();
        }
    });
};

function getSecret(request, id, login, callback) {
    if (!request || !login) {
        return callback();
    }
    
    try {
        var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        var userAgent = request.headers["user-agent"];
        
        var secret = "";
        var cipher = crypto.createCipher('aes192', passphrase);
        cipher.on('readable', () => {
            var dataStream = cipher.read();
            if (dataStream) {
                secret += dataStream.toString('hex');
            } else {
                return callback(secret);
            }
        });
        
        var accountSecret = {
            ip: ip,
            userAgent: userAgent,
            id: id,
            login: login
        };
        
        var json = JSON.stringify(accountSecret);
        cipher.write(json);
        cipher.end();
    } catch(err) {
        console.log(err);
        return callback();
    }
}

function decryptAndTestSecret(request, secret, callback) {
    if (!request || !secret) {
        return callback();
    }
    
    try {
        var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        var userAgent = request.headers["user-agent"];
        
        var decipher = crypto.createDecipher('aes192', passphrase);
        var json = "";
        decipher.on('readable', () => {
            var dataStream = decipher.read();
            if (dataStream) {
                json += dataStream.toString();
            } else {
                var secretAccount = JSON.parse(json);
                if (ip === secretAccount.ip && userAgent === secretAccount.userAgent) {
                    return callback(secretAccount);    
                } else {
                    return callback();
                }
            }
        });
    
        decipher.write(secret, 'hex');    
        decipher.end();
    } catch(err) {
        console.log(err);
        return callback();
    }
}

function Uint8ArrayConcat(first, second)
{
    var firstLength = first.length,
        result = new Uint8Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}

module.exports = account;