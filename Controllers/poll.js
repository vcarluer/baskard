var poll = function() {};

poll.render = function(pollData) {
    document.querySelector(".pollTitle").innerHTML = pollData.title;
};

module.exports = poll;