// Player - player object

var Player = function(){
	this.connected = true;
	this.name = "";
	this.socket = null;
	this.socketip = "0.0.0.0";
}

module.exports = Player;