// Game - game object (backend)

var Game = function(){
	// required fields
	this.name = "Avalon";
	this.player_count = [5,10]; // min and max player inclusive
	this.playtime = "20+ min"; // string indicating playtime

	this.mainHTML = "index.html";
	this.playerHTML = "player.html";

	this.mappableFolders = ["js", "css"];

	// optional	fields
	// for cover art on main hub
	this.cover_img = "https://cf.geekdo-images.com/itemrep/img/yottt6aVvGBSOp3D0k4dno5_n3Y=/fit-in/246x300/pic1398895.jpg",
	// game logic fields
	this.players = {};
	this.playerIDs = [];
	var GameState = {
		king: 0,
		vote: 1,
		quest: 2
	}
	var gameState = GameState.king;
	
	var currentKing = -1; // id of current king
	var currentQuesting = []; // IDs of players who go on questing

	var questNumber = [2,3,2,3,3] // how many players required for each quest
	var currQuest = 0;

	// required functions
	this.initPlayers = function(players){
		for (var i in players){
			var p = players[i];
			this.players[p.id] = {
				id: p.id,
				name: p.name,
				ishost: p.host,
				// game fields
				isKing: false,
				vote: undefined, // bool
				quest: undefined, // bool
				role: undefined, // string
			};
			this.playerIDs.push(p.id);
		}
	}
	// initPlayers would already be called
	this.initMainHTML = function(html){
		this.initializeGame();
		html = html.replace("{{PLAYERS}}", JSON.stringify(this.players));
		return html;
	}
	this.initPlayerHTML = function(playerID, html){
		html = html.replace("{{PLAYERNAME}}", this.players[playerID].name);
		html = html.replace("{{ISHOST}}", this.players[playerID].ishost);
		html = html.replace("{{PLAYERID}}", playerID);
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
		// broadcast data to this player
	}
	this.onPlayerDisconnect = function(playerID){
		this.sendEventToMain("PLAYER_DISCONNECT", playerID);
	}
	this.onReceiveEventFromPlayer = function(playerID, event, payload){
		switch(event){
			case "PLAYER_KING_SELECT":
				// payload is a list of IDs
				// king selected a list of players
				currentQuesting = payload;
				gameState = GameState.vote;
				loopPlayers((id, p) => {p.vote = undefined;});		
				this.sendEventToAll("GAME_STATE", {
					ev: "VOTE",
					load: currentQuesting.map((id) => this.players[id].name)
				});
				break;
			case "PLAYER_VOTE":
				// payload is bool
				this.players[playerID].vote = payload;
				var allvote = true;
				var voteresult = 0;
				loopPlayers((id, p) => {
					if (typeof p.vote == "undefined"){
						allvote = false;
					}else{
						voteresult += p.vote ? 1 : -1;
					}
				});
				if (allvote){
					if (voteresult < 0){
						// voting did not pass
						this.incrementKing();
						gameState = GameState.king;
						this.sendEventToPlayers([currentKing], "GAME_STATE", {
							ev: "KING",
							load: questNumber[currQuest]
						})
					}else{
						// voting passed
						gameState = GameState.quest;
						loopPlayers((id, p) => {p.quest = undefined;});
						this.sendEventToPlayers(currentQuesting, "GAME_STATE", {
							ev: "QUEST",
							load: 0
						})
					}
					var load = {};
					loopPlayers((id, p) => {load[id] = p.vote});
					this.sendEventToAll("VOTING_RESULT", load);
				}
				break;
			case "PLAYER_QUEST":
				// payload is bool
				this.players[playerID].quest = payload;
				var allvote = true;
				var questres = 0;
				loopPlayers((id, p) => {
					if (currentQuesting.indexOf(id) >= 0){
						if (typeof p.quest == "undefined"){
							allvote = false;
						}else{
							questres += p.quest ? 1 : -1;
						}
					}
				})
				if (allvote){
					this.sendEventToMain("QUEST_RESULT", questres >= 0);
					this.incrementKing();
					gameState = GameState.king;
					currQuest += 1;
					this.sendEventToPlayers([currentKing], "GAME_STATE", {
						ev: "KING",
						load: questNumber[currQuest]
					})
				}
				break;
		}
	}
	this.onReceiveEventFromMain = function(event, payload){}

	// optional functions
	this.emitData = function(){
		// send game data to all
		var data = {
			current_quest: currQuest,
			all_quests: questNumber,
			game_state: gameState,
			current_king: currentKing,
			players_onquest: currentQuesting,
			players: this.players.map((p) => {
				var temp = copy(p);
				temp.role = undefined;
				return temp;
			})
		}
	}
	this.loopPlayers = function(callback){
		if (typeof callback != "function") return;
		for(var i = 0; i < this.playerIDs.length; i++){
			var id = this.playerIDs[i]
			callback(id, this.players[id]);
		}
	}
	var copy = function(c){
		return JSON.parse(JSON.stringify(c));
	}
	var randInt = function(l, h){
		// inclusive, exclusive
		return Math.floor(Math.random() * (h - l));
	}
	// In Avalon, game logic will be handled in the back end (here) instead of main
	this.initializeGame = function(){
		// get players to choose available roles
		questNumber = [2,3,2,3,3];
		this.initializeRoles();
		this.initializeKing();
	}
	var roleDistribution = {
		// [good, evil]
		5: [3, 2],
		6: [4, 2],
		7: [4, 3],
		8: [5, 3],
		9: [6, 3],
		10: [6, 4],
	};
	// a player should pick available roles in the start
	var availableRoles = ["Merlin", "Assassin", "Servant", "Minion", "Servant"];

	this.initializeRoles = function(){
		var players = this.players;
		if (this.playerIDs.length in roleDistribution){
			var distribution = copy(roleDistribution[this.playerIDs.length]);

			for (var i = 0; i < this.playerIDs.length; i++){
				var p = playesr[this.playerIDs[i]];
				p.role = availableRoles.splice(randInt(0, availableRoles.length), 1);
			}
		}
	}
	this.initializeKing = function(){
		var players = this.players;
		var id = this.playerIDs[randInt(0, this.playerIDs.length)];
		players[id].isKing = true;
		currentKing = id;
	}

	this.incrementKing = function(){
		var players = this.players;
		for (var i = 0; i < this.playerIDs.length; i++){
			if(players[this.playerIDs[i]].isKing){
				players[this.playerIDs[i]].isKing = false;
				var k = i == this.playerIDs.length - 1 ? 0 : i + 1;
				players[this.playerIDs[k]].isKing = true;
				currentKing = this.playerIDs[k];
			}
		}
	}


}

module.exports = new Game();