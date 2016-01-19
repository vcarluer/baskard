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

account.getAPIKey = function () {
    var id;
    try {
        if (localStorage.user) {
            var user = JSON.parse(localStorage.user);
            if (user) {
                id = user.secret;
            }
        }
        
        return id;
    }
    catch(err) {
        console.log(err);
    }
};

account.render = function() {
    var account = this.get(), loggedIn = account.secret, self = this;
    document.getElementById("changeLogin").style.display = "none";
    if (loggedIn) {
        document.getElementById("loginAvatar").setAttribute("src", this.getAvatar(account.avatar, 80));
        document.getElementById("loginregister").style.display = "none";
        document.getElementById("loggedIn").style.display = "inline-block";
        document.getElementById("loggedIn").innerHTML = "@" + account.login + "<i class='fa fa-pencil'></i>";
        document.getElementById("loggedIn").onclick = function() { self.startChangeLogin(account.login); };
        
        var disconnectButton = document.createElement("button");
        disconnectButton.innerHTML = "Disconnect";
        disconnectButton.onclick = function () { self.disconnect(); };
        document.getElementById("loggedIn").appendChild(disconnectButton);
    } else {
        document.getElementById("loginregister").style.display = "inline-block";
        document.getElementById("loggedIn").style.display = "none";
    }
};

account.getAvatar = function(hash, size) {
    if (!size) {
        size = 80;
    }
    
    return "https://www.gravatar.com/avatar/" + hash + ".jpg&s=" + size + "&mm"
};

account.startChangeLogin = function(login) {
    var self = this;
    document.getElementById("loggedIn").style.display = "none";
    document.getElementById("changeLogin").style.display = "inline-block";
    document.getElementById("newLogin").value = login;
    document.getElementById("changeLoginButton").onclick = function() {
          self.changeLogin(document.getElementById("newLogin").value);
    };
    
    document.getElementById("cancelLoginButton").onclick = function() {
        document.getElementById("loggedIn").style.display = "inline-block";
        document.getElementById("changeLogin").style.display = "none";
    };
};

account.changeLogin = function(newLogin) {
    if (newLogin) {
        var self = this, data = { login: newLogin }, account = this.get();;
        if (account) {
            reqwest({
               url: "/api/accountpwl",
               method: "PATCH",
               data: JSON.stringify(data),
               headers: {
                   'x-authentication': account.secret
               },
               success: function (resp) {
                    console.log("login changed " + resp);
                    
                    account.login = newLogin;
                    localStorage.user = JSON.stringify(account);
                    self.render();
               },
               error: function(resp) {
                   console.log(resp);
                   self.render();
               }    
            });    
        }
    }
};

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}