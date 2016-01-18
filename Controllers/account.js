/*global reqwest*/
"use strict";
var account = function() {};

account.bind = function() {
    var self = this;
    document.getElementById("loginButton").onclick = function() {
        self.login();
    };
    
    document.getElementById("registerButton").onclick = function() {
        self.register();
    };
};

account.login = function() {
    var self = this;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    if (login && password) {
        reqwest({
           url: "/api/account",
           headers: {
               'x-login': login,
               'x-password': password
           },
           method: "GET",
           success: function (resp) {
               self.logSuccess(resp);
           },
           error: function(resp) {
               localStorage.user = "";
               console.log(resp);
           }
        });        
    }
};

account.register = function() {
    var self = this;
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    var data = { login: login, password: password };
    if (login && password) {
        reqwest({
           url: "/api/account",
           data: JSON.stringify(data),
           method: "POST",
           success: function (resp) {
               self.logSuccess(resp);
           },
           error: function(resp) {
               localStorage.user = "";
               console.log(resp);
           }
        });        
    }
};

account.logSuccess = function(account) {
    localStorage.user = JSON.stringify(account);
    this.render();
};

account.disconnect = function() {
    localStorage.user = "";
    this.render();
    poll.refresh();
};

account.get = function () {
    var account = {};
    try {
        if (localStorage.user) {
            account = JSON.parse(localStorage.user);
        }
    }
    catch (err) {
        console.log(err);
    }
    
    return account;
};

account.render = function() {
    var account = this.get(), loggedIn = account.secret, self = this;
    
    if (loggedIn) {
        document.getElementById("loginregister").style.display = "none";
        document.getElementById("loggedIn").style.display = "block";
        document.getElementById("loggedIn").innerHTML = "@" + account.login;
        var disconnectButton = document.createElement("button");
        disconnectButton.innerHTML = "Disconnect";
        disconnectButton.onclick = function () { self.disconnect(); };
        document.getElementById("loggedIn").appendChild(disconnectButton);
    } else {
        document.getElementById("loginregister").style.display = "block";
        document.getElementById("loggedIn").style.display = "none";
    }
};