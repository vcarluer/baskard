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

poll.render = function(pollData) {
    document.querySelector(".pollTitle").innerHTML = pollData.title;
};

poll.ask = function(question) {
    var data = { ask: question };
    reqwest({
       url: "/api/poll",
       method: "POST",
       data: JSON.stringify(data),
       success: function (resp) {
           console.log("question asked!");
       },
       error: function(resp) {
           console.log(resp);
       }
   });
};