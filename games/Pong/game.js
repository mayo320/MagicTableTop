// Game - game object (backend)

var Game = function(){
	// required fields
	this.name = "Pong";
	this.player_count = [2]; // [min, max] player inclusive, if min==max, just have 1 value
	this.playtime = "few min"; // string indicating playtime

	this.mainHTML = "index.html";
	this.playerHTML = "player.html";

	this.mappableFolders = ["js", "css"];

	// optional	fields
	this.cover_img = "https://pong-2.com/icon-256.png"
	this.players = [];

	// required functions
	this.initPlayers = function(players){
		// only connected players will be passed in
		for(var i in players){
			var p = players[i];
			this.players.push({
				id: p.id,
				name: p.name,
				ishost: p.host
			});
		}
	}
	this.initMainHTML = function(html){
		html = html.replace("{{P1ID}}", this.players[0].id);
		html = html.replace("{{P2ID}}", this.players[1].id);
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		html = html.replace("{{PLAYERID}}", playerID);
		return html;
	}

	this.sendEventToPlayers = function(players, event, payload){
		// players = list of int representing player id (the p.id in initPlayers)
		// leave this function empty (will be filled at run time)
	}
	this.sendEventToMain = function(event, payload){
		// leave this function empty (will be filled at run time)
	}
	this.sendEventToAll = function(event, payload){
		// leave this function empty (will be filled at run time)
	}

	// Fill these out
	this.onPlayerConnect = function(playerID){}
	this.onPlayerDisconnect = function(playerID){}
	this.onReceiveEventFromPlayer = function(playerID, event, payload){
		if(event == "PLAYER_ACTION"){
			var json = {}
			if (this.players[0].id == playerID){
				json.p1 = payload;
			}else if (this.players[1].id == playerID){
				json.p2 = payload;
			}
			this.sendEventToMain("PLAYER_ACTION", json);
		}
	}
	this.onReceiveEventFromMain = function(event, payload){

	}

	// optional functions
}

module.exports = new Game();