// Player - player object

var Player = function(){
	this.id = -1;
	this.connected = true;
	this.name = "";
	this.socket = null;
	this.socketip = "0.0.0.0";
	this.host = false;
	this.automaticRejoin = false; // if connected, automatically simulate ev-playerjoin event
	this.session = null;

	this.connect = function(){
		this.connected = true;
	}
	this.disconnect = function(){
		this.connected = false;
	}
	this.update = function(socket){
		this.socket = socket;
		this.socketip = socket.request.connection.remoteAddress;
	}
	this.updateName = function(playername){
		// Check for dupe names 
		var count = 0;
		var pname = playername;
		for (var i = 0; i < this.session.players.length; i++){
			if (this.session.players[i].id == this.id) continue;
			if (this.session.players[i].name == playername ||
				this.session.players[i].name == pname) {
				count++;
				pname = playername + "("+count+")";		
			}
		}
		this.name = pname;
	}
}

module.exports = Player;