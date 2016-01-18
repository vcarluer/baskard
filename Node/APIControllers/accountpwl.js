var host = "polact-vcarluer.c9users.io";
if (!process.env.IP) {
     host = "polact.herokuapp.com";   
}

var pg = require('pg');
var nodemailer = require("nodemailer");
var passphrase = "cette application rox du poney";
const crypto = require("crypto");
var url = require('url');

// todo: Read connection string from uncommited file
var connectionString = "postgres://fvtjauwobkigbf:8reHZ_30Uj-6js4s1nY66ktN0l@ec2-54-247-170-228.eu-west-1.compute.amazonaws.com:5432/d6t3vp05h61n8r?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
var account = function() {};

account.get = function(response, body, request) {
    var token = request.headers["x-pending-token"];
    var json;
    
    if (!token) {
        response.writeHead("401", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 10, message: "No token provided" });
        response.write(json);
        return response.end();
    }
    
    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        
        var query = "SELECT pendinglogin.token as token, pendinglogin.accountId as id, account.login as login FROM pendinglogin " +
                    "LEFT OUTER JOIN account on account.id = pendinglogin.accountId WHERE pendinglogin.token = '" + token + "';";
        console.log("running query: " + query);
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
            
            if (result.rowCount === 0) {
                response.writeHead("401", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 6, error: "No such pending token request." });
                response.write(json);
                return response.end();
            }
            
            var pendingLogin = result.rows[0];
            query = "DELETE FROM pendinglogin where accountId = " + pendingLogin.id + ";";
            
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
            
                getSecret(request, pendingLogin.id.toString(), pendingLogin.login, function(secret) {
                    if (secret) {
                        response.writeHead("200", { "content-type": "application/json"});
                        json = JSON.stringify({ id: pendingLogin.id, login: pendingLogin.login, secret: secret });
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
};

account.patch = function(response, body, request) {
    var json;
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.login == 'undefined'){
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            if (!body.login || body.login.length > 32) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "login cannot be null and longer than 32 characters." });
                response.write(json);
                return response.end();
            }
            
            var query = "UPDATE account set login = '" + body.login.replace(/'/g, "''") + "' where id = " + body.userId + ";";
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
                
                response.writeHead("200", { "content-type": "application/json"});
                json = JSON.stringify({ message: "login updated" });
                response.write(json);
                return response.end();
            });
        });
    }
};

account.post = function(response, body, request) {
    var json, self = this;
    console.log("received: " + body);
    if (body) {
        pg.connect(connectionString, function(err, client, done) {
            if(err) {
                return console.error('error fetching client from pool', err);
            }
            
            if (typeof body.email == 'undefined'){
                response.writeHead("400", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 5, error: "Missing data in body" });
                response.write(json);
                return response.end();
            }
            
            if (!body.email || body.email.length > 255) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "email cannot be null and longer than 255." });
                response.write(json);
                return response.end();
            }
            
            if (!body.email.indexOf("@")) {
                response.writeHead("403", { "content-type": "application/json"});
                json = JSON.stringify({ errorCode: 1, error: "email does not contain any @." });
                response.write(json);
                return response.end();
            }
            
            var login   = body.email.substring(0, body.email.lastIndexOf("@"));
            var query = "select id, login from account where email = '" + body.email.replace(/'/g, "''") + "';";
            console.log("running query: " + query);
            client.query(query, function(err, result) {
                //call `done()` to release the client back to the pool 
                done();
                
                if(err) {
                  return console.error('error running query', err);
                }
                
                if (result.rowCount === 0) {
                    // Create email account if does not exist
                    query = "INSERT into account (login, email) values('" + login.replace(/'/g, "''") + "','" + body.email.replace(/'/g, "''") + "');";
                    console.log("running query: " + query);
                    client.query(query, function(err, result) {
                        //call `done()` to release the client back to the pool 
                        done();
                        
                        if(err) {
                          return console.error('error running query', err);
                        }
                        
                        query = "select id from account where email = '" + body.email.replace(/'/g, "''") + "';";
                        console.log("running query: " + query);
                        client.query(query, function(err, result) {
                            //call `done()` to release the client back to the pool 
                            done();
                            
                            if(err) {
                              return console.error('error running query', err);
                            }
                        
                            self.sendLoginToken(result.rows[0].id, body.email, login, true, response, client, done);
                        });
                    });
                } else {
                    self.sendLoginToken(result.rows[0].id, body.email, login, false, response, client, done);
                }
            });
        });
    } else {
        response.writeHead("400", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 4, error: "Missing body" });
        response.write(json);
        return response.end();
    }
};

account.sendLoginToken = function(accountId, email, login, newAccount, response, client, done) {
    var json;
    if (!email) {
        response.writeHead("500", { "content-type": "application/json"});
        json = JSON.stringify({ errorCode: 500, error: "email must be defined" });
        response.write(json);
        return response.end();
    }
    
    // pour debloquer gmail : 
    // https://support.google.com/accounts/answer/6010255?hl=en
    // http://stackoverflow.com/questions/19877246/nodemailer-with-gmail-and-nodejs
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'beckouille@gmail.com',
            pass: 'coolcool'
        }
    });
    
    crypto.randomBytes(48, function(ex, buf) {
        console.log(ex);
        var token = buf.toString('hex');
        
        var query = "INSERT into pendinglogin (token, accountId) values('" + token + "'," + accountId + ");";
        console.log("running query: " + query);
        client.query(query, function(err, result) {
            //call `done()` to release the client back to the pool 
            done();
            
            if(err) {
              return console.error('error running query', err);
            }
        
            var tokenLink = "https://" + host + "?token=" + token;
            
            // NB! No need to recreate the transporter object. You can use
            // the same transporter object for all e-mails
            var body = "";
            var htmlBody = "";
            if (newAccount) {
                body = "Hello " + login + ", you have successfully set up your polact account and you can now access it by clicking on the following link: " + tokenLink;
                htmlBody = "Hello <b>" + login + "</b>, you have successfully set up your <b>polact</b> account and you can now access it by <b>clicking on the following link</b>: " + tokenLink;
            } else {
                body = "Hello " + login + ", welcome back to polact. Click the following link to log in: " + tokenLink;
                htmlBody = "Hello <b>" + login + "</b>, welcome back to <b>polact</b>. Click the following link to log in: " + tokenLink;
            }
            
            
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: 'polact application <noreply@polact.com>', // sender address
                to: email, // list of receivers
                subject: '✔ Connect to polact', // Subject line
                text: body, // plaintext body
                html: htmlBody // html body
            };
            
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    response.writeHead("500", { "content-type": "application/json"});
                    json = JSON.stringify({ errorCode: 500, error: "error during mail sending" });
                    response.write(json);
                    return response.end();
                }
                
                console.log('Message sent: ' + info.response);
                
                response.writeHead("200", { "content-type": "application/json"});
                json = JSON.stringify({ message: "token sent to email" });
                response.write(json);
                return response.end();
            });
        });
    });
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