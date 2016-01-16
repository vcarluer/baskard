var firstPoll = {
    title: "Sondage pour le prochain jeu !"
};

var poll = function() {};
poll.get = function(response) {
    response.writeHead("200", { "content-type": "application/json"});
    response.write(JSON.stringify(firstPoll));
    response.end();
};

poll.post = function(response, body) {
    console.log("received: " + body);
    response.writeHead("200", { "content-type": "application/json"});
    response.end();
};

module.exports = poll;