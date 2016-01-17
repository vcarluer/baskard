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
    
    document.getElementById("disconnectButton").onclick = function() {
        self.disconnect();
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
               logSuccess(resp);
               self.render(resp);
           },
           error: function(resp) {
               localStorage.user = {};
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
               logSuccess(resp);
               self.render(resp);
           },
           error: function(resp) {
               localStorage.user = {};
               console.log(resp);
           }
        });        
    }
};

function logSuccess(account) {
    localStorage.user = JSON.stringify(account);
};

account.disconnect = function() {
    localStorage.user = {};
    this.render();
    poll.refresh();
};

account.render = function(polls) {
    if (localStorage.user.secret) {
        document.getElementById("loginregister").style.display = "none";
        document.getElementById("loggedIn").style.display = "block";
        document.getElementById("loggedIn").innerHTML = "@" + localStorage.user.login;
    } else {
        document.getElementById("loginregister").style.display = "block";
        document.getElementById("loggedIn").style.display = "none";
    }
};