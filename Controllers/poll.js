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
    
    document.getElementById("delete").onclick = function() {
        self.delete(2);
    };
};

poll.render = function(pollData) {
    document.querySelector(".pollTitle").innerHTML = pollData.question;
};

poll.ask = function(question) {
    var data = { question: question };
    reqwest({
       url: "/api/poll",
       method: "POST",
       data: JSON.stringify(data),
       success: function (resp) {
           console.log("question asked! " + resp);
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};

poll.delete = function(id) {
    var data = { id: id };
    reqwest({
       url: "/api/poll",
       method: "DELETE",
       data: JSON.stringify(data),
       success: function (resp) {
           console.log(id + " deleted");
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};