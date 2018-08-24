// Server - contains server object

var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var path = require("path");
var fs = require("fs");
var helmet = require("helmet");

var Server = function(config, callback){
	var port = config.port;

	console.log("Listening on port " + port);

	server.listen(port, config.address);

	// Handle requests
	app.use(function(req, res, next){
		return next();
	});
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.status(500).send("Something broke :(");
	});
	app.use(helmet());

	// Map static path to app path 
	app.use("/js", express.static(__dirname));
	var dirs = ["games"];
	for (var i in dirs){
		app.use(dirs[i], express.static(path.resolve(global.root_path + dirs[i])));
	}

	// Callback returning to app.js with express app and socket.io
	if (typeof callback === "function") {
		callback(app, io);
	}
}

module.exports = Server;