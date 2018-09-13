
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
		UIUpdateGameStatus(payload.ev, payload.load);
	});
	socket.onReceiveEvent("PLAYERS_INFO", function(payload){
		players = payload.players;
	});



	$.each(players, function(i, p){
		if (p.id == myID){
			player = p;
		}
	});

	king_players_template = $("#king .player.template").parent().html();
	$("#king .player.template").parent().html("");
	UIUpdateKingPlayers();

	other_players_template = $("#other-players #pallies").html();
	$("#other-players #pallies").html("");
	UIUpdateOtherPlayers();

	UIUpdatePlayerRole();

	voting_result_template = $("#voting_result").html();
	$("#voting_result").html("");
	UIUpdateVotingResult();
});
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
	if (typeof roles[player.role].img != "string"){
		$("#player-card #pcard img").attr("src", roles[player.role].img[randInt(0,roles[player.role].img.length)]);
	}else{
		$("#player-card #pcard img").attr("src", roles[player.role].img);
	}
	$("#player-card #pcard .role").html(player.role);
	$("#player-card #pcard .description").html(roles[player.role].description);
}

function UIUpdateVotingResult(){
	$list = $("#voting_result");
	$.each(players, function(i, p){
		$list.append(voting_result_template);
		$li = $list.find("li:last");
		$li.find(".name").html(p.name);
		if (voting_results[p.id]){
			$li.find(".role").removeClass("reject").addClass("accept");
		}else{
			$li.find(".role").removeClass("accept").addClass("reject");
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

function sendSelectedPlayers(){
	// king selected players.
	socket.sendEvent("PLAYER_KING_SELECT", kingSelectedPlayers);
}
function sendVote(vote){
	socket.sendEvent("PLAYER_VOTE", vote);
}
function sendQuestResult(res){
	socket.sendEvent("PLAYER_QUEST", res);
}
function sendAssasinate(playerID){
	// used by Assassin only.
	socket.sendEvent("PLAYER_ASSASSINATE", playerID);
}