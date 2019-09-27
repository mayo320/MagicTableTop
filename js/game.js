// Game - template object (backend)

var path = require("path");
var fs = require("fs");
var express = require("express");
const log = require(__dirname + "/log.js");

var Game = function(gameFolderName, session){
 	var gameRootPath = path.resolve(global.root_path + "/games/" + gameFolderName);
	var gameObjectPath = path.resolve(gameRootPath + "/game.js");
	var gameObject = require(gameObjectPath);

	this.hash = "";
	this.gameObject = new gameObject();
	this.folder_name = gameFolderName;
	this.name = this.gameObject.name;
	this.home_path = gameRootPath;
	this.player_count = this.gameObject.player_count;
	this.playtime = this.gameObject.playtime;
	this.cover_img = this.gameObject.cover_img ? this.gameObject.cover_img : "";

	this.playersIO;
	this.mainIO;
	this.players; // list of Player objects
	this.session = session;

	this.mainHTML = path.resolve(this.home_path + "/" + (this.gameObject.mainHTML ? "index.html" : this.gameObject.mainHTML));
	this.playerHTML = path.resolve(this.home_path + "/" + (this.gameObject.playerHTML ? "player.html" : this.gameObject.playerHTML));

	// Functions
	this.init = function(){
		this.hash = log.getHash();
		this.gameObject = new gameObject();
		this.gameObject.hash = this.hash;
		log.info("Creating new game with hash " + this.hash);
	}
	this.startGame = function(){
		this.session.ingame = true;
		this.players = this.session.players;
		for (var i in this.players){
			this.playerJoin(this.players[i]);
		}

		this.mainIO.clients((err, clients) => {
			// Join main client to this game room
			for (var i in clients){
				this.mainIO.connected[clients[i]].join(this.hash);
			}
		});

		if (typeof this.gameObject.initPlayers == "function"){
			var players = [];
			for (var i in this.players){
				var p = this.players[i];
				var maxp = this.player_count.length == 2 ? this.player_count[1] : this.player_count[0];
				if(players.length <= maxp && p.connected){
					players.push({name:p.name, id:p.id, host:p.host});
				}
			}
			this.gameObject.initPlayers(players);
		}
	}
	this.endGame = function(){
		log.info("Ending game " + this.name);
		this.session.ingame = false;
		this.players = this.session.players;
		for (var i in this.players){
			this.playerLeave(this.players[i]);
		}

		this.mainIO.clients((err, clients) => {
			for (var i in clients){
				this.mainIO.connected[clients[i]].leave(this.hash);
			}
		});
		delete this.gameObject;
		this.gameObject = null;
	}
	this.playerJoin = function(player){
		player.socket.join(this.hash);
		// player.socket.join(this.folder_name);
	}
	this.playerLeave = function(player){
		player.socket.leave(this.hash);
		// player.socket.leave(this.folder_name);
	}

	this.setupHTML = function(app){
		var relPath = "/games/"+this.folder_name;
		app.use(relPath, express.static(this.home_path));
		for (var i in this.gameObject.mappableFolders){
			var n = this.gameObject.mappableFolders[i];
			app.use(relPath + "/" + n, express.static(this.home_path + "/" + n));
		}

		app.get("/main/" + this.folder_name, (req, res) => {
			if (this.gameObject == null) log.error("gameObject is NULL! Game hash: " + this.hash);
			var html = fs.readFileSync(this.mainHTML, {encoding: "utf8"});
			html = this.gameObject.initMainHTML(html);
			res.send(html);
		});

		app.get("/" + this.folder_name, (req, res) => {
			if (this.gameObject == null) log.error("gameObject is NULL! Game hash: " + this.hash);
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
		this.playersIO = io.of("/player");
		this.mainIO = io.of("/main")

		this.gameObject.sendEventToPlayers = (players, event, payload) => {
			players = players.map((x) => parseInt(x));
			for (var i in this.players){
				if (players.indexOf(this.players[i].id) >= 0){
					this.players[i].socket.emit(event, payload);
				}
			}
		}
		this.gameObject.sendEventToMain = (event, payload) => {
			this.mainIO.emit(event, payload);
		}
		this.gameObject.sendEventToAll = (event, payload) => {
			this.mainIO.emit(event, payload);
			this.playersIO.emit(event, payload);
		}
	}

	this.toMainpageJson = function(){
		var json = {};
		json.name = this.name;
		json.folder_name = this.folder_name;
		json.player_count = this.player_count;
		json.playtime = this.playtime;
		json.cover = this.cover_img;
		return json;
	}
	this.toJSON = function(){
		var clients = [];
		this.playersIO.clients((err, c) => clients = c);
		return { 
			playerRooms: this.players.map((p) => Object.keys(p.socket.rooms)),
			playerClients: clients
		};
	}
}

module.exports = Game;