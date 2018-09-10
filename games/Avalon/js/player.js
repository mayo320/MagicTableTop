
var players = [
	{
		name: "Jack", id:0
	},
	{
		name: "Salman", id:4
	},
	{
		name: "Jim", id:2
	},
	{
		name: "Bran", id:3
	},
	{
		name: "Farhat", id:1
	},
];

var kingSelectedPlayers = [];
var king_players_template = "";
$(document).ready(function(){

	king_players_template = $("#king .player.template").parent().html();
	$("#king .player.template").parent().html("");
	UIUpdateKingPlayers();

});

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

	if (kingSelectedPlayers.length == 3){
		$("#king .btn").attr("disabled", false);
	}else{
		$("#king .btn").attr("disabled", true);
	}

}
