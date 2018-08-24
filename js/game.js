// Game - template object (backend)

var path = require("path");
var fs = require("fs");
var express = require("express");

var Game = function(gameObject, session){
	this.gameObject = gameObject;
	this.name = gameObject.name;
	this.home_path = path.resolve(global.root_path + "/games/" + this.name);
	this.player_count = gameObject.player_count;
	this.playtime = gameObject.playtime;

	this.playersIO;
	this.mainIO;
	this.players; // list of Player objects
	this.session = session;

	this.mainHTML = path.resolve(this.home_path + "/" + (gameObject.mainHTML ? "index.html" : gameObject.mainHTML));
	this.playerHTML = path.resolve(this.home_path + "/" + (gameObject.playerHTML ? "player.html" : gameObject.playerHTML));

	// Functions
	this.init = gameObject.init;

	this.setupHTML = function(app){
		console.log(this.home_path);
		var relPath = "/games/"+this.name;
		app.use(relPath, express.static(this.home_path));
		for (var i in this.gameObject.mappableFolders){
			var n = this.gameObject.mappableFolders[i];
			app.use(relPath + "/" + n, express.static(this.home_path + "/" + n));
		}

		app.get("/main/" + this.name, (req, res) => {
			var html = fs.readFileSync(this.mainHTML, {encoding: "utf8"});
			html = this.gameObject.initMainHTML(html);
			res.send(html);
		});

		app.get("/" + this.name, (req, res) => {
			var html = fs.readFileSync(this.playerHTML, {encoding: "utf8"});
			var p = this.session.findPlayerByIp(req.ip);

			if (p != null){
				html = this.gameObject.initPlayerHTML(p.id, html);
				res.send(html);
			}else{
				res.send("<h2>You are not a player.</h2>")
			}
		});
	}
	this.setupSocketIO = function(io){
		playersIO = io.of("/player");
		mainIO = io.of("/main");
	}

	this.toMainpageJson = function(){
		var json = {};
		json.name = this.name;
		json.player_count = this.player_count;
		json.playtime = this.playtime;
		return json;
	}
}

module.exports = Game;