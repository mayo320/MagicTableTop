// Game - game object (backend)

var Game = function(){
	// required fields
	this.name = "Avalon";
	this.player_count = [4,10]; // min and max player inclusive
	this.playtime = "20+ min"; // string indicating playtime

	this.mainHTML = "index.html";
	this.playerHTML = "player.html";

	this.mappableFolders = ["js", "css"];

	// optional	fields
	// for cover art on main hub
	this.cover_img = "https://cf.geekdo-images.com/itemrep/img/yottt6aVvGBSOp3D0k4dno5_n3Y=/fit-in/246x300/pic1398895.jpg",
	
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
		initializeGame();
		html = html.replace("{{PLAYERS}}", JSON.stringify(this.players));
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		var myID = this.IDLUT.indexOf(playerID);
		html = html.replace("{{PLAYERNAME}}", this.players[playerID].name);
		html = html.replace("{{ISHOST}}", this.players[playerID].ishost);
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
		this.sendEventToMain(event, payload);
	}
	this.onReceiveEventFromMain = function(event, payload){
		switch(event){
			case "PLAYER_ACTION":
				// Send to specific player
				this.sendEventToPlayers([this.IDLUT[payload]], "PLAYER_TURN", true);
				break;
			case "BROADCAST":
				// Send to all
				this.sendEventToAll("BROADCAST", payload);
				break;
			case "GAMEOVER":
				this.sendEventToAll("GAMEOVER", payload);
		}
	}

	// optional functions
	// In Avalon, game logic will be handled in the back end (here) instead of main
	var initializeGame = function(){

	}
}

module.exports = new Game();