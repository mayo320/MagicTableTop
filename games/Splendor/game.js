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
	this.IDLUT = []; // index: playerID in front end; value at index: playerID in backend

	// required functions
	this.initPlayers = function(players){
		for (var i in players){
			var p = players[i];
			this.players[p.id] = {
				id: p.id,
				name: p.name,
				ishost: p.host
			};
			this.IDLUT.push(p.id);
		}
	}
	// initPlayers would already be called
	this.initMainHTML = function(html){
		html = html.replace("{{PLAYERS}}", JSON.stringify(this.players));
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		var myID = this.IDLUT.indexOf(playerID);
		html = html.replace("{{PLAYERNAME}}", this.players[playerID].name);
		html = html.replace("{{PLAYERID}}", myID);
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
	this.onPlayerConnect = function(playerID){
		this.sendEventToMain("PLAYER_CONNECT", this.IDLUT.indexOf(playerID));
	}
	this.onPlayerDisconnect = function(playerID){
		this.sendEventToMain("PLAYER_DISCONNECT", this.IDLUT.indexOf(playerID));
	}
	this.onReceiveEventFromPlayer = function(playerID, event, payload){
		if (event == "PICK_CARD" || event == "PICK_COIN" || event == "RESERVE_CARD"){
			this.sendEventToMain(event, payload);
		}
	}
	this.onReceiveEventFromMain = function(event, payload){
		switch(event){
			case "PLAYER_TURN":
				// Send to specific player
				this.sendEventToPlayers([this.IDLUT[payload]], "PLAYER_TURN", true);
				break;
			case "BROADCAST":
				// Send to all
				this.sendEventToAll("BROADCAST", payload);
				break;
		}
	}

	// optional functions
}

module.exports = new Game();