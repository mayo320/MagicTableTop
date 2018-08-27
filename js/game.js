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
	this.startGame = function(){
		this.session.ingame = true;
		this.players = this.session.players;
		for (var i in this.players){
			this.playerJoin(this.players[i]);
		}

		this.mainIO.clients((err, clients) => {
			// Join main client to this game room
			for (var i in clients){
				this.mainIO.connected[clients[i]].join(this.name);
			}
		});

		if (typeof this.gameObject.initPlayers == "function"){
			var players = [];
			for (var i in this.players){
				var p = this.players[i];
				
				if(players.length <= this.player_count[1] && p.connected){
					players.push({name:p.name, id:p.id, host:p.host});
				}
			}
			this.gameObject.initPlayers(players);
		}
	}
	this.endGame = function(){
		this.session.ingame = false;
		this.players = this.session.players;
		for (var i in this.players){
			this.playerLeave(this.players[i]);
		}

		this.mainIO.clients((err, clients) => {
			for (var i in clients){
				this.mainIO.connected[clients[i]].leave(this.name);
			}
		});
	}
	this.playerJoin = function(player){
		player.socket.join(this.name);
	}
	this.playerLeave = function(player){
		player.socket.leave(this.name);
	}

	this.setupHTML = function(app){
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
		this.playersIO = io.of("/player");
		this.mainIO = io.of("/main");

		this.mainIO.in(this.name).on("connection", (socket) => {
			socket.use((packet, next) => {
				this.gameObject.onReceiveEventFromMain(packet[0], packet[1]);
				next();
			})
		});

		this.playersIO.in(this.name).on("connection", (socket) => {
			var p = session.findPlayerByIp(socket.request.connection.remoteAddress);
			if (p != null){
				this.gameObject.onPlayerConnect(p.id);
			}

			socket.use((packet, next) => {
				var p = session.findPlayerByIp(socket.request.connection.remoteAddress);
				this.gameObject.onReceiveEventFromPlayer(p.id, packet[0], packet[1]);
				next();
			});

			socket.on("disconnect", () => {
				var p = session.findPlayerByIp(socket.request.connection.remoteAddress);
				if (p != null){
					this.gameObject.onPlayerDisconnect(p.id);
				}
			});
		});

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
		json.player_count = this.player_count;
		json.playtime = this.playtime;
		return json;
	}
}

module.exports = Game;