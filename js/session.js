// Session - holds info about current game session

var Player = require(__dirname + "/player.js");

var Session = function(){
	this.initialized = false;
	this.ingame = false;
	this.players = [];
	this.game = null;

	this.initialize = function(){
		this.initialized = true;
	}

	this.addPlayer = function(playername, socket){
		var player = new Player();
		player.name = playername;
		player.update(socket);
		player.id = this.players.length;
		this.players.push(player);
		return player;
	}
	this.findPlayerByIp = function(socketip){
		for(var i in this.players){
			if (this.players[i].socketip == socketip){
				return this.players[i];
			}
		}
		return null;
	}

	this.toJSON = function(){
		var d = {};

		d.players = [];
		for(var i in this.players){
			var p = this.players[parseInt(i)];
			var pd = {
				id: p.id,
				name: p.name, 
				ip: p.socketip,
				ishost: p.host
			};
			d.players.push(pd);
		}

		return d;
	}
}

module.exports = new Session();