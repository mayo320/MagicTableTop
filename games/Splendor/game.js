// Game - game object (backend)

var Game = function(){
	// required fields
	this.name = "Splendor";
	this.player_count = [2,4]; // min and max player inclusive
	this.playtime = "20+ min"; // string indicating playtime

	this.mainHTML = "index.html";
	this.playerHTML = "player.html";

	this.mappableFolders = ["js", "css"];

	// optional	fields
	this.players = {};

	// required functions
	this.initMainHTML = function(html){
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		html = html.replace("{{PLAYERNAME}}", this.players[playerID].name);
		return html;
	}
	this.initPlayers = function(players){
		for (var i in players){
			var p = players[i];
			this.players[p.id] = {
				id: p.id,
				name: p.name
			}
		}
	}

	this.sendEventToPlayers = function(players, event, payload){
		// players = list of int representing player id
		// leave this function empty (will be filled at run time)
	}
	this.sendEventToMain = function(event, payload){
		// leave this function empty (will be filled at run time)
	}
	this.sendEventToAll = function(event, payload){
		// leave this function empty (will be filled at run time)
	}

	this.onReceiveEventFromPlayer = function(playerID, event, payload){
		// use "disconnect" for user disconnect event
		console.log("received " + event + " from player " + playerID + " with payload " + payload);
		this.sendEventToPlayers(Object.keys(this.players), event, payload);
	}
	this.onReceiveEventFromMain = function(event, payload){
		// console.log("received " + event + " from main" + " with payload " + payload);
		switch(event){
			case "PLAYER_TURN":
				// Send to specific player
				this.sendEventToPlayers([payload], "PLAYER_TURN", true);
				break;
			case "BROADCAST":
				// Send to all players
				this.sendEventToPlayers(Object.keys(this.players), "BROADCAST", payload);
				break;
		}
	}

	// optional functions
}

module.exports = new Game();