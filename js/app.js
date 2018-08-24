// App - Core application

var fs = require("fs");
var path = require("path");
var Server = require(__dirname + "/server.js");


global.root_path = path.resolve(__dirname + "/../");


var App = function(){
	var config;

	this.start = function(callback){
		console.log("Loading configuration file...");
		config = require(global.root_path + "/config.js");

		var server = new Server(config, function(app, io){

		});

		if (typeof callback == "function"){
			callback(config);
		}
	}
}

module.exports = new App();