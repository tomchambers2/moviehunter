var http = require('follow-redirects').http;
var Promise = require('promise');
var url = require('url');

function getData(url) {
	return new Promise(function (resolve, reject) {
		http.get(url, function(response) {
			response.setEncoding('utf8')
			var data = '';
			response.on('data', function (chunk) {
				data += chunk;
			});
			response.on('end', function() {
				resolve(data);
			})
		});
	});
};

function requestHandler(request, response) {
	requestedUrl = url.parse(request.url, true).query.url;

	response.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    // Request methods you wish to allow
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');


	if (!requestedUrl) {
		response.writeHead(400);
		response.write("ERROR: No url supplied for proxy to get, add a url GET parameter");
		response.end();
		return;
	}

	console.log(requestedUrl);

	getData(requestedUrl).done(function(res) {
		response.writeHead(200);
		console.log('Proxy get request success');

		console.log(res);

		response.write(res);
		response.end();
	});
};

var server = http.createServer(requestHandler);

server.listen(8080);