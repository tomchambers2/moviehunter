var http = require('http');

//function for calling the requested url and returning content

//set up request handler callback function
	//call the getter
function requestHandler(request, response) {
	response.writeHead(200);
}

//set up the server that calls request handler
var server = http.createServer(requestHandler);

//listen on port 8080
server.listen(8080);