// Game - game object (backend)

var Game = function(){
	// required fields
	this.name = "Catan";
	this.player_count = [2,4]; // min and max player inclusive
	this.playtime = "40+ min"; // string indicating playtime

	this.mainHTML = "index.html";
	this.playerHTML = "player.html";

	this.mappableFolders = ["js", "css"];

	// optional	fields
	this.cover_img = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Catan-2015-boxart.jpg/250px-Catan-2015-boxart.jpg"
	

	// required functions
	this.initPlayers = function(players){}
	this.initMainHTML = function(html){
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
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

	}
	this.onReceiveEventFromMain = function(event, payload){

	}

	// optional functions
}

module.exports = new Game();