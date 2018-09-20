
var players = [
	{
		name: "Jack", id:0, role: "Servant"
	},
	{
		name: "Salman", id:4, role: ""
	},
	{
		name: "Jim", id:2, role: "Merlin"
	},
	{
		name: "Bran", id:3, role: "Merlin"
	},
	{
		name: "Farhat", id:1, role: ""
	},
];
var player = {};
var cur_role_count = 0;

var voting_results = { // indexing is player id
	0: false, 1: true, 2: true, 3: true, 4: false 
};
var kingSelectedPlayers = [];
var kingSelectableNum = 0;
var king_players_template = "";
var other_players_template = "";
var voting_result_template = "";
var socket;
$(document).ready(function(){
	socket = new MTSocket("player");
	socket.onReceiveEvent("VOTING_RESULT", function(payload){
		voting_results = payload;
		UIUpdateVotingResult();
	});
	socket.onReceiveEvent("GAME_STATE", function(payload){
		console.log(payload);
		UIUpdateKingPlayers();
		UIUpdateGameStatus(payload.ev, payload.load);
	});
	socket.onReceiveEvent("PLAYERS_INFO", function(payload){
		players = payload.players;
		console.log(players);
		updatePlayerVar();
		UIUpdateOtherPlayers();
		UIUpdatePlayerRole();
	});
	socket.onReceiveEvent("EMIT", function(payload){
		console.log(payload);
		voting_results = payload.last_voting_result;
		UIUpdateVotingResult();
	});
	socket.onReceiveEvent("ROLES_INFO", function(payload){
		rolesCount = payload;
	});
	socket.onReceiveEvent("GAME_START", function(payload){
		console.log("Game starting..")
		$(".game-frame").removeClass("hidden");
		$("#role_selection").addClass("hidden");
	});

	if (typeof backendPlayers != "undefined"){
		players = backendPlayers;
	}

	UIUpdateGameStatus();

	updatePlayerVar();
	
	king_players_template = $("#king .player.template").parent().html();
	$("#king .player.template").parent().html("");
	// UIUpdateKingPlayers();

	other_players_template = $("#other-players #pallies").html();
	$("#other-players #pallies").html("");
	// UIUpdateOtherPlayers();

	// UIUpdatePlayerRole();

	voting_result_template = $("#voting_result").html();
	$("#voting_result").html("");
	// UIUpdateVotingResult();

	if (isHost && initializingState == GameState.selecting_roles){
		var $role = $("#role_selection");
		$role.removeClass("hidden");
		$role.find(".num_players").html(players.length);
		var $ul = $role.find("ul");
		var html = ""
		$.each(Object.keys(roles), function(i, r){
			var role = roles[r];
			html += "<li class='list-group-item'>";
			html += "<h4 class='name'><span class='num'>"+rolesCount[r].count+"</span> | "+r+"</h4>";
			html += "<div class='role'><div onclick='removeRole(this,\""+r+"\")'><h4>-</h4></div>";
			html += "<div onclick='addRole(this,\""+r+"\")'><h4>+</h4></div></div>";
			html += "</li>"
		})
		$ul.html(html);
		if (rolesCount.count == players.length){
			$("#role_selection .btn").attr("disabled", false);
		}else{
			$("#role_selection .btn").attr("disabled", true);
		}
	}else if(initializingState != GameState.selecting_roles){
		$(".game-frame").removeClass("hidden");
		$("#role_selection").addClass("hidden");
	}

});
function updatePlayerVar(){
	$.each(players, function(i, p){
		if (p.id == myID){
			player = p;
		}
	});
}
function UIUpdateGameStatus(ev, payload){
	$("#game-state .item").addClass("hidden");
	$("#game-state .card-body").removeClass("hidden");
	switch(ev){
		case "KING":
			$("#game-state #king").removeClass("hidden");
			kingSelectableNum = parseInt(payload);
			$("#game-state #king .num").html(payload);
			break;
		case "VOTE":
			$("#game-state #vote").removeClass("hidden");
			var string = ""
			$.each(payload, function(i, p){
				string += "<li><h5>>"+p+"</h5></li>";
			});
			$("#game-state #vote ul").html(string);
			break;
		case "QUEST":
			$("#game-state #onquest").removeClass("hidden");
			break;
		default:
			$("#game-state .card-body").addClass("hidden");
			break;
	}
}

function UIUpdateKingPlayers(){
	var $list = $("#king .row");
	$list.html("");
	$.each(players, function(i, player){
		$list.append(king_players_template);
		var $player = $list.find(".player:last");
		$player.attr("p-name", player.name)
		$player.attr("p-id", player.id)
		$player.find("h3").html(player.name);
	});
}

function UIUpdateOtherPlayers(){
	var $list = $("#pallies");
	$list.html("");
	$.each(players, function(i, player){
		if (myID != player.id && player.role){
			$list.append(other_players_template);
			var $player = $list.find("li:last");
			$player.find(".name").html(player.name);
			$player.find(".role").html(player.role);
		}
	});	
}

function UIUpdatePlayerRole(){
	if (player.role){
		if (typeof roles[player.role].img != "string"){
			$("#player-card #pcard img").attr("src", roles[player.role].img[randInt(0,roles[player.role].img.length)]);
		}else{
			$("#player-card #pcard img").attr("src", roles[player.role].img);
		}
		$("#player-card #pcard .role").html(player.role);
		$("#player-card #pcard .description").html(roles[player.role].description);
	}
}

function UIUpdateVotingResult(){
	$list = $("#voting_result");
	$list.html("");
	$.each(players, function(i, p){
		$list.append(voting_result_template);
		$li = $list.find("li:last");
		$li.find(".name").html(p.name);
		$li.removeClass("hidden");
		if (p.id in voting_results){
			if (voting_results[p.id]){
				$li.find(".role").removeClass("reject").addClass("accept");
			}else{
				$li.find(".role").removeClass("accept").addClass("reject");
			}
		}else{
			$li.addClass("hidden");
		}
	});
}

function randInt(l, h){
		// inclusive, exclusive
		return Math.floor(Math.random() * (h - l));	
}

function hideID(id){
	var $obj = $("#" + id);
	if ($obj.hasClass("hidden")){
		$obj.removeClass("hidden");
	}else{
		$obj.addClass("hidden");
	}
}

function selectPlayer(obj){
	var name = $(obj).attr("p-id");

	if($(obj).hasClass("selected")){
		$(obj).removeClass("selected");
		kingSelectedPlayers.splice(kingSelectedPlayers.indexOf(name), 1);
	}else{
		$(obj).addClass("selected");
		if (kingSelectedPlayers.indexOf(name) < 0) kingSelectedPlayers.push(name);
	}

	if (kingSelectedPlayers.length == kingSelectableNum && kingSelectableNum != 0){
		$("#king .btn").attr("disabled", false);
	}else{
		$("#king .btn").attr("disabled", true);
	}

}

function sendGameStatus(ev, load){
	$popup = $("#popup");
	$popup.removeClass("hidden");
	switch(ev){
		case "KING":
			$popup.find(".header").html("King");
			var body = "You want to send these players on quest?<br>";
			for (var i = 0; i < players.length; i++){
				if (kingSelectedPlayers.indexOf(players[i].id.toString()) >= 0) {
					body += " > " + players[i].name + "<br>";
				}
			}
			$popup.find(".body").html(body);
			$popup.find(".yes").attr("onclick", "sendSelectedPlayers()");
			$popup.find(".no").attr("onclick", '{$("#popup").addClass("hidden");}');
			break;
		case "VOTE":
			$popup.find(".header").html("Voting");
			$popup.find(".body").html("You are " + (load ? "ACCEPTING" : "REJECTING"));
			$popup.find(".yes").attr("onclick", "sendVote("+load+")");
			$popup.find(".no").attr("onclick", '{$("#popup").addClass("hidden");}');
			break;
		case "QUEST":
			$popup.find(".header").html("Questing");
			$popup.find(".body").html("You want to " + (load ? "PASS" : "FAIL") + " the quest?");
			$popup.find(".yes").attr("onclick", "sendQuestResult("+load+")");
			$popup.find(".no").attr("onclick", '{$("#popup").addClass("hidden");}');
			break;
	}
}

function sendSelectedPlayers(){
	// king selected players.
	$("#popup").addClass("hidden");
	socket.sendEvent("PLAYER_KING_SELECT", kingSelectedPlayers);
	UIUpdateGameStatus();
}
function sendVote(vote){
	$("#popup").addClass("hidden");
	socket.sendEvent("PLAYER_VOTE", vote);
	UIUpdateGameStatus();
}
function sendQuestResult(res){
	$("#popup").addClass("hidden");
	socket.sendEvent("PLAYER_QUEST", res);
	UIUpdateGameStatus();
}
function sendAssasinate(playerID){
	// used by Assassin only.
	$("#popup").addClass("hidden");
	socket.sendEvent("PLAYER_ASSASSINATE", playerID);
}
function sendRequestEmit(){
	socket.sendEvent("EMIT", 1);
}

function numOfAlignment(a){
	// a: 0=good, 1=evil
	return rolesCount.alignment[a];
}
function sendRoles(){
	socket.sendEvent("PLAYER_ROLES", {
		ev: "CONFIRM"
	});
}
function addRole(obj, role){
	var pcount = players.length;
	pcount = pcount < 5 ? 5 : pcount;
	if (rolesCount.count < players.length){
		if (rolesCount[role].count < rolesCount[role].max &&
			numOfAlignment(roles[role].alignment) < rolesCount.distribution[pcount][roles[role].alignment]){
			rolesCount[role].count += 1;
			rolesCount.count += 1;
			rolesCount.alignment[roles[role].alignment] += 1;
			socket.sendEvent("PLAYER_ROLES", {
				ev: "ADD",
				role: role
			});
		}		
		$(obj).closest(".list-group-item").find(".num").html(rolesCount[role].count);
	}
	if (rolesCount.count == players.length){
		$("#role_selection .btn").attr("disabled", false);
	}else{
		$("#role_selection .btn").attr("disabled", true);
	}
}

function removeRole(obj, role){
	if (rolesCount[role].count > rolesCount[role].min &&
		numOfAlignment(roles[role].alignment) > 0){
		rolesCount[role].count -= 1;
		rolesCount.count -= 1;
		rolesCount.alignment[roles[role].alignment] -= 1;
		$(obj).closest(".list-group-item").find(".num").html(rolesCount[role].count);
		socket.sendEvent("PLAYER_ROLES", {
			ev: "REMOVE",
			role: role
		});
	}



	if (rolesCount.count == players.length){
		$("#role_selection .btn").attr("disabled", false);
	}else{
		$("#role_selection .btn").attr("disabled", true);
	}
}

