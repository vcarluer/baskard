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
    polls.forEach(function(pollDoc) {
        var poll = JSON.parse(pollDoc.json)
        var pollDom = document.createElement("div");
        pollDom.className = "poll";
        
        var ownerImage = document.createElement("img");
        ownerImage.className = "ownerImage"
        ownerImage.src = account.getAvatar(poll.avatar, 40);
        pollDom.appendChild(ownerImage);
        
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
        
        var ownerInfo = document.createElement("div");
        ownerInfo.className = "ownerInfo";
        ownerInfo.innerHTML = "@" + poll.login;
        pollDom.appendChild(ownerInfo);
        
        var ownerActions = document.createElement("div");
        ownerActions.className = "ownerActions";
        pollDom.appendChild(ownerActions);
        if (userAccount.id == poll.ownerId) {
            var openClose = document.createElement("button");
            ownerActions.appendChild(openClose);
            openClose.innerHTML = "Close";
            openClose.onclick = function () {
                
            };    
            
            var del = document.createElement("button");
            ownerActions.appendChild(del);
            del.innerHTML = "del";
            del.onclick = function () {
                self.delete(poll.id);
            };    
        }
        
        var votesDiv = document.createElement("div");
        votesDiv.className = "votes";
        pollDom.appendChild(votesDiv);
        
        var plus = document.createElement("div");
        plus.className = "voteYes vote";
        votesDiv.appendChild(plus);
        var plusLink = document.createElement("a");
        plusLink.setAttribute("href", "#");
        plus.appendChild(plusLink);
        var plusText = "";

        // if contains owner
        if (userAccount && poll.yesers && poll.yesers[userAccount.id]) {
            plusText += "[<i class='fa fa-thumbs-o-up'></i>]";
            plusLink.onclick = function () {
                self.delVote({ pollId: poll.id });  
            };
            
            plusText += " " + poll.yesCount;
        } else {
            plusText += "<i class='fa fa-thumbs-o-up'></i>";
            plusLink.onclick = function () {
                self.vote({ pollId: poll.id, yes: true});  
            };
        }
        
        plusLink.innerHTML = plusText;
        
        var moins = document.createElement("div");
        moins.className = "voteNo vote";
        votesDiv.appendChild(moins);
        var moinsLink = document.createElement("a");
        moinsLink.setAttribute("href", "#");
        moins.appendChild(moinsLink);
        var moinsText = "";
        if (userAccount && poll.noers && poll.noers[userAccount.id]) {
            moinsText += "[<i class='fa fa-thumbs-o-down'></i>]";
            moinsLink.onclick = function () {
                self.delVote({ pollId: poll.id});  
            };
            
            moinsText += " " + poll.noCount;
        } else {
            moinsText += "<i class='fa fa-thumbs-o-down'></i>";
            moinsLink.onclick = function () {
                self.vote({ pollId: poll.id, no: true});  
            };
        }
        moinsLink.innerHTML = moinsText;
        
        self.renderVoters(poll, pollDom);
        
        
        pollListDom.appendChild(pollDom);
    });
};

poll.renderVoters = function(poll, pollDom) {
    var votersDom = document.createElement("div");
    votersDom.className = "voters";
    pollDom.appendChild(votersDom);
    this.renderVoter(poll.yesers, poll, votersDom);
    this.renderVoter(poll.noers, poll, votersDom);
};

poll.renderVoter = function(voters, poll, votersDom) {
    var key, voter;
    // voters is an object / parsed array
    for(key in voters) {
        voter = voters[key];
        var voterDom = document.createElement("img");
        voterDom.className = "voterImage"
        voterDom.src = account.getAvatar(voter.avatar, 20);
        votersDom.appendChild(voterDom);
    }
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
            document.getElementById("ask").value ="";
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