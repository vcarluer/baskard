/*global reqwest*/
"use strict";
var poll = function() {};

poll.bind = function() {
    var self = this;
    document.getElementById("askSubmit").onclick = function() {
        var question = document.getElementById("ask").value;
        if (question) {
            self.ask(question);
        }
    };
};

poll.refresh = function(pollId) {
    var url = "/api/poll";
    if (pollId) {
        url += "/" + pollId;
    }
    
    reqwest({
       url: url,
       headers: {
           'x-authentication': account.getAPIKey()
       },
       method: "GET",
       success: function (resp) {
           poll.render(resp);
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};

poll.render = function(polls) {
    var self = this;
    var pollListDom = document.getElementById("polls");
    var userAccount = account.get();
    
    while (pollListDom.hasChildNodes()) {
        pollListDom.removeChild(pollListDom.lastChild);
    }
    polls.forEach(function(poll) {
        var pollDom = document.createElement("div");
        pollDom.className = "poll";
        var pollLink = document.createElement("a");
        pollLink.setAttribute("href", "#");
        pollLink.onclick = function() {
            window.location.href = "/poll/" + poll.id;
        };
        
        pollDom.appendChild(pollLink);
        
        var question = document.createElement("div");
        question.className = "question";
        pollLink.appendChild(question);
        question.innerHTML = poll.question;
        
        if (userAccount.id === poll.ownerid) {
            var del = document.createElement("button");
            pollDom.appendChild(del);
            del.innerHTML = "del";
            del.onclick = function () {
                self.delete(poll.id);
            };    
        }
        
        var plus = document.createElement("div");
        plus.className = "choice";
        pollDom.appendChild(plus);
        var plusLink = document.createElement("a");
        plusLink.setAttribute("href", "#");
        plus.appendChild(plusLink);
        var plusText = "";

        if (poll.useryes) {
            plusText += "(<i class='fa fa-thumbs-o-up'></i>)";
            plusLink.onclick = function () {
                self.delVote({ pollId: poll.id });  
            };
            
            plusText += " " + poll.yes;
        } else {
            plusText += "<i class='fa fa-thumbs-o-up'></i>";
            plusLink.onclick = function () {
                self.vote({ pollId: poll.id, yes: true});  
            };
        }
        
        plusLink.innerHTML = plusText;
        
        var moins = document.createElement("div");
        moins.className = "choice";
        pollDom.appendChild(moins);
        var moinsLink = document.createElement("a");
        moinsLink.setAttribute("href", "#");
        moins.appendChild(moinsLink);
        var moinsText = "";
        if (poll.userno) {
            moinsText += "(<i class='fa fa-thumbs-o-down'></i>)";
            moinsLink.onclick = function () {
                self.delVote({ pollId: poll.id});  
            };
            
            moinsText += " " + poll.no;
        } else {
            moinsText += "<i class='fa fa-thumbs-o-down'></i>";
            moinsLink.onclick = function () {
                self.vote({ pollId: poll.id, no: true});  
            };
        }
        moinsLink.innerHTML = moinsText;
        
        pollListDom.appendChild(pollDom);
    });
};

poll.onVoteClick = function() {
      
};

poll.ask = function(question) {
    var self = this;
    var data = { question: question };
    reqwest({
       url: "/api/poll",
       method: "POST",
       data: JSON.stringify(data),
       headers: {
           'x-authentication': account.getAPIKey()
       },
       success: function (resp) {
           console.log("question asked! " + resp);
           self.refresh();
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};

poll.delete = function(id) {
    var self = this;
    var data = { id: id };
    reqwest({
       url: "/api/poll",
       method: "DELETE",
       data: JSON.stringify(data),
       headers: {
           'x-authentication': account.getAPIKey()
       },
       success: function (resp) {
           console.log(id + " deleted");
           self.refresh();
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};

poll.vote = function(data) {
    var self = this;
    reqwest({
       url: "/api/vote",
       method: "POST",
       data: JSON.stringify(data),
       headers: {
           'x-authentication': account.getAPIKey()
       },
       success: function (resp) {
           console.log("vote done " + resp);
           self.refresh();
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};

// Need pollId and userId
poll.delVote = function(data) {
    var self = this;
    reqwest({
       url: "/api/vote",
       method: "DELETE",
       data: JSON.stringify(data),
       headers: {
           'x-authentication': account.getAPIKey()
       },
       success: function (resp) {
           console.log("vote removed " + resp);
           self.refresh();
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};