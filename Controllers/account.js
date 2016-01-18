/*global reqwest*/
"use strict";
var account = function() {};

account.bind = function() {
    var self = this;
    document.getElementById("connectButton").onclick = function() {
        self.connect();
    };
};

account.login = function(token) {
    var self = this;
    if (token) {
        reqwest({
        url: "/api/accountpwl",
        headers: {
           'x-pending-token': token
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

account.connect = function() {
    var self = this;
    var email = document.getElementById("email").value;
    var data = { email: email };
    if (email) {
        reqwest({
           url: "/api/accountpwl",
           data: JSON.stringify(data),
           method: "POST",
           success: function (resp) {
               console.log("Mail sent");
               // self.connectSuccess(resp);
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
    window.location.href = "/";
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

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}