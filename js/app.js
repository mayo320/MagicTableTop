// App - Core application

var fs = require("fs");
var path = require("path");
var session = require(__dirname + "/session.js");
var Server = require(__dirname + "/server.js");
var Game = require(__dirname + "/game.js");


global.root_path = path.resolve(__dirname + "/../");


var App = function(){
	var config;
	var games = [];

	/* setupGames()
	 * populate the games array with data.
	 *
	 * argument express object - the express app object
	 */
	 var setupGames = function(config){
	 	for(var i in config.games){
	 		var gameConfig = config.games[i];
		 	var gameObjectPath = path.resolve(global.root_path + "/games/" + gameConfig.name + "/game.js");
	 		var game = new Game(require(gameObjectPath));

	 		if (typeof game != "undefined"){
	 			games.push(game);
	 		}else{
	 			console.error("Game is undefined");
	 		}
	 	}
	 }

	/* setupHTML(app)
	 * Set up responses to url requests
	 *
	 * argument express object - the express app object
	 */
	var setupHTML = function(app){
		// Main page that is shown on mirror
		app.get("/main", (req, res) => {
			if (!session.initialized || true){
				session.initialize();
				var html = fs.readFileSync(path.resolve(global.root_path + "/index.html"), {encoding: "utf8"});
				var json = [];
				for (var i in games){
					json.push(games[i].toMainpageJson());
				}
				html = html.replace("{{GAMES}}", JSON.stringify(json));
				res.send(html);
			}else{
				res.send("<h1>HEY! This is not the Magic Tabletop??</h1>");
			}
		});

		// Default is player joining
		app.get("/", (req, res) => {
			if (!session.initialized){
				res.send("<h1>Main menu is not yet initialized</h1>");
			}
			else{
				var html = fs.readFileSync(path.resolve(global.root_path + "/join.html"), {encoding: "utf8"});
				res.send(html);
			}
		});
	}

	/* setupSocketIO(io)
	 * Set up sockets
	 *
	 * argument socket.io - the io object
	 */
	var setupSocketIO = function(io){
		// IO Test
		io.on("connection", function(socket){
			socket.on("ev-playerjoin", function(playername){
				var p = session.findPlayer(socket.request.connection.remoteAddress);

				if (p == null){
					console.log(playername + " Joined");
					p = session.addPlayer(playername, socket);
				}else{
					p.name = playername;
				}

				if (p != null){
					io.emit("ev-playerjoin", {
						name: p.name, 
						socketid: p.socket.id,
						clientip: p.socketip
					});
				}
			});

			socket.on("disconnect", function(){
				var p = session.findPlayer(socket.request.connection.remoteAddress);

				if (p != null){
					io.emit("ev-playerleave", {
						name: p.name, 
						socketid: p.socket.id,
						clientip: p.socketip
					});
				}
			});
		});
	}

	/* start(callback)
	 * Start the app
	 *
	 * argumetn callback - callback function to set main.js config
	 */
	this.start = function(callback){
		console.log("Loading configuration file...");
		config = require(global.root_path + "/config.js");

		var server = new Server(config, function(app, io){
			setupGames(config);
			setupHTML(app);
			setupSocketIO(io);
		});

		if (typeof callback == "function"){
			callback(config);
		}
	}

}

module.exports = new App();