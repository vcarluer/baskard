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
        
        var ownerImage = document.createElement("img");
        ownerImage.className = "ownerImage"
        ownerImage.src = account.getAvatar(poll.avatar, 40);
        pollDom.appendChild(ownerImage);
        
        var pollLink = document.createElement("a");
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
        ownerInfo.innerHTML = poll.login;
        pollDom.appendChild(ownerInfo);
        
        var ownerActions = document.createElement("div");
        ownerActions.className = "ownerActions";
        pollDom.appendChild(ownerActions);
        if (userAccount.id == poll.ownerId) {
            var del = document.createElement("button");
            ownerActions.appendChild(del);
            del.innerHTML = "del";
            del.onclick = function () {
                self.delete(poll.id);
            };    
        }
        
        
        var share = document.createElement("button");
        ownerActions.appendChild(share);
        share.innerHTML = "share";
        share.onclick = function () {
            document.getElementById("messages").innerHTML = "Copy the poll link: https://" + window.location.hostname + "/poll/" + poll.id;
        };    
        
        var votesDiv = document.createElement("div");
        votesDiv.className = "votes";
        pollDom.appendChild(votesDiv);
        
         // user has voted
        var hasVoted = userAccount && 
                        (poll.yesers && poll.yesers[userAccount.id]) ||
                        (poll.noers && poll.noers[userAccount.id]);
        
        
        var plus = document.createElement("div");
        plus.className = "voteYes vote";
        votesDiv.appendChild(plus);
        var plusLink = document.createElement("a");
        plus.appendChild(plusLink);
        
        var yesCount = document.createElement("div");
        yesCount.className = "count";
        plusLink.appendChild(yesCount);
        yesCount.innerHTML = hasVoted ? poll.yesCount : "";
        
        var yesButton = document.createElement("i");
        yesButton.className = "yesButton fa fa-thumbs-o-up";
        plusLink.appendChild(yesButton);
        
        // if yes contains owner
        if (userAccount && poll.yesers && poll.yesers[userAccount.id]) {
            yesButton.className += " blue";
            plusLink.onclick = function () {
                self.delVote({ pollId: poll.id });  
            };
        } else {
            plusLink.onclick = function () {
                self.vote({ pollId: poll.id, yes: true});  
            };
        }
        
        var moins = document.createElement("div");
        moins.className = "voteNo vote";
        votesDiv.appendChild(moins);
        var moinsLink = document.createElement("a");
        moins.appendChild(moinsLink);
        
        var noButton = document.createElement("i");
        noButton.className = "noButton fa fa-thumbs-o-down";
        moinsLink.appendChild(noButton);
        
        // if no contains owner
        if (userAccount && poll.noers && poll.noers[userAccount.id]) {
            noButton.className += " red";
            moinsLink.onclick = function () {
                self.delVote({ pollId: poll.id });  
            };
        } else {
            moinsLink.onclick = function () {
                self.vote({ pollId: poll.id, no: true});  
            };
        }
        
         var noCount = document.createElement("div");
        noCount.className = "count";
        moinsLink.appendChild(noCount);
        noCount.innerHTML = hasVoted ? poll.noCount : "";
        
        
        self.renderVoters(poll, pollDom);
        self.renderTimestamp(poll, pollDom);
        pollListDom.appendChild(pollDom);
    });
};

poll.renderTimestamp = function(poll, pollDom) {
    if (poll.timestamp) {
        var timestampDom = document.createElement("div");
        timestampDom.className = "timestamp";
        pollDom.appendChild(timestampDom);
        var time = new Date(poll.timestamp);
        var day = time.getDate();
        var month = time.getMonth() + 1;
        var year = time.getFullYear();
        var seconds = time.getSeconds();
        var minutes = time.getMinutes();
        var hour = time.getHours();
        timestampDom.innerHTML = month + "/" + day + "/" + year + " " + hour + ":" + minutes + ":" + seconds;
    }
};

poll.renderVoters = function(poll, pollDom) {
    var votersDom = document.createElement("div");
    votersDom.className = "voters";
    pollDom.appendChild(votersDom);
    this.renderVoter(poll.yesers, poll, votersDom, "votersyes");
    this.renderVoter(poll.noers, poll, votersDom, "votersno");
};

poll.renderVoter = function(voters, poll, votersDom, className) {
    var key, voter;
    var votersGroup = document.createElement("div");
    votersGroup.className = className;
    votersDom.appendChild(votersGroup);
    // voters is an object / parsed array
    for(key in voters) {
        voter = voters[key];
        var voterDom = document.createElement("img");
        voterDom.setAttribute("title", voter.login);
        voterDom.className = "voterImage"
        voterDom.src = account.getAvatar(voter.avatar, 20);
        
        votersGroup.appendChild(voterDom);
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
           document.getElementById("messages").innerHTML = "You must be logged";
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