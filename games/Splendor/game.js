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

	// required functions
	this.initMainHTML = function(html){
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		return html;
	}

	this.sendEventToPlayers = function(players, event, payload){
		// players = list of int representing player id
	}
	this.sendEventToMain = function(event, payload){

	}
	this.onReceiveEventFromPlayer = function(playerID, event, payload){

	}
	this.onReceiveEventFromMain = function(event, payload){

	}
	this.init = function(){

	}

	// optional functions
}

module.exports = new Game();