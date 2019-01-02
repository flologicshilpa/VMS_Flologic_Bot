// var request = require('request');
var rp = require('request-promise');
var smallTalkReplies = require('./smalltalk');

function Client(opts) {
    if (!opts.knowledgeBaseId) throw new Error('knowledgeBaseId is required');
    if (!opts.subscriptionKey) throw new Error('subscriptionKey is required');

    var self = this;
    this.knowledgeBaseId = opts.knowledgeBaseId;
    this.subscriptionKey = opts.subscriptionKey;
    this.scoreThreshold = opts.scoreThreshold ? opts.scoreThreshold : 20; // 20 is the default
}

Client.prototype.post = function (opts, cb) {

    if (!opts.question) throw new Error('question is required');
    cb = cb || (() => { });

    var self = this;

    var host = " https://gplflologicqnauat.azurewebsites.net/qnamaker";

    // Authorization endpoint key
    // From Publish Page
    var endpoint_key = this.subscriptionKey;
    
    // Management APIs postpend the version to the route
    // From Publish Page, value after POST
    // Example: /knowledgebases/ZZZ15f8c-d01b-4698-a2de-85b0dbf3358c/generateAnswer
    var route = "/knowledgebases/"+ this.knowledgeBaseId +"/generateAnswer";
    
    // JSON format for passing question to service
    //var question = {'question': 'Is the QnA Maker Service free?','top': 3};




    //var url = 'https://gplflologicqnauat.azurewebsites.net/qnamaker/' + this.knowledgeBaseId + '/generateAnswer';

    var options = {
        uri: host + route,
        method: 'POST',
        headers: {
            'Authorization': "EndpointKey " + endpoint_key
        },
        json: true,
        body: opts
    };

    rp(options)
        .then(function (body) {
            // POST succeeded
            var botreply;
            var answerobj = body.answers[0];

            if (answerobj.score >= self.scoreThreshold) {
                // Answer confidence score is acceptable - use QnA maker's response
                var botreplylist = smallTalkReplies[answerobj.answer];
                botreply = botreplylist[Math.floor(Math.random() * botreplylist.length)];
            }

            return cb(null, botreply);
        })
        .catch(function (err) {
            // POST failed
            return cb(err);
        });
}

module.exports = Client;
