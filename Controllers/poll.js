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

poll.refresh = function() {
    reqwest({
       url: "/api/poll",
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
    while (pollListDom.hasChildNodes()) {
        pollListDom.removeChild(pollListDom.lastChild);
    }
    polls.forEach(function(poll) {
        var pollDom = document.createElement("div");
        poll.className = "poll";
        var question = document.createElement("div");
        question.className = "question";
        pollDom.appendChild(question);
        question.innerHTML = poll.question;
        var del = document.createElement("button");
        pollDom.appendChild(del);
        del.innerHTML = "del";
        del.onclick = function () {
            self.delete(poll.id);
        };
        
        var plus = document.createElement("div");
        plus.className = "choice";
        pollDom.appendChild(plus);
        plus.innerHTML = "<a href='#'>+ " + poll.yes + "</a>";
        var moins = document.createElement("div");
        moins.className = "choice";
        pollDom.appendChild(moins);
        moins.innerHTML = "<a href='#'>- " + poll.no + "</a>";
        
        pollListDom.appendChild(pollDom);
    });
};

poll.ask = function(question) {
    var self = this;
    var data = { question: question };
    reqwest({
       url: "/api/poll",
       method: "POST",
       data: JSON.stringify(data),
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
       success: function (resp) {
           console.log(id + " deleted");
           self.refresh();
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};