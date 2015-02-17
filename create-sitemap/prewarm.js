var request = require('request');
var RateLimiter = require('limiter').RateLimiter;
// Allow 150 requests per hour (the Twitter search limit). Also understands
// 'second', 'minute', 'day', or a number of milliseconds
var limiter = new RateLimiter(5, 'second');

var urls = require('./urls');

for (var i = 0; i < urls.length; i++) {
	limiter.removeTokens(1, function() {
		request(urls[i], function (error, response, data) {
			if (error) return error;
			console.log("Accessed "+urls[i]);
		});
	});
};