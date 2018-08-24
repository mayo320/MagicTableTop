// Player - player object

var Player = function(){
	this.id = -1;
	this.connected = true;
	this.name = "";
	this.socket = null;
	this.socketip = "0.0.0.0";

	this.connect = function(){
		this.connected = true;
	}
	this.disconnect = function(){
		this.connected = false;
	}
}

module.exports = Player;