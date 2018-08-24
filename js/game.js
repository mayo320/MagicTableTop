// Game - template object

var path = require("path");

var Game = function(gameObject){
	this.name = gameObject.name;
	this.home_path = path.resolve(global.root_path + "/games/" + this.name + "/");
	this.player_count = gameObject.player_count;
	this.playtime = gameObject.playtime;

	this.html = path.resolve(this.home_path + (gameObject.html ? "index.html" : gameObject.html));

	this.init = gameObject.init;

	this.toMainpageJson = function(){
		var json = {};
		json.name = this.name;
		json.player_count = this.player_count;
		json.playtime = this.playtime;
		return json;
	}
}

module.exports = Game;