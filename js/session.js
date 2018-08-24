// Session - holds info about current game session

var Player = require(__dirname + "/player.js");

var Session = function(){
	this.initialized = false;
	this.players = [];
	this.game = null;

	this.initialize = function(){
		this.initialized = true;
	}

	this.addPlayer = function(playername, socket){
		var player = new Player();
		player.name = playername;
		player.socket = socket;
		player.socketip = socket.request.connection.remoteAddress;
		this.players.push(player);
		return player;
	}
	this.findPlayer = function(socketip){
		for(var i in this.players){
			if (this.players[i].socketip == socketip){
				return this.players[i];
			}
		}
		return null;
	}
}

module.exports = new Session();