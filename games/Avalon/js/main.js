
var data = {};

var roletemplate = "";
$(document).ready(function(){
	socket = new MTSocket("main");
	socket.onReceiveEvent("PLAYER_CONNECT", function(payload){
		console.log("p connected ", payload);
	});
	socket.onReceiveEvent("PLAYER_DISCONNECT", function(payload){
		console.log("p disconnected ", payload);
	});
	socket.onReceiveEvent("ROLES", function(payload){
		availableRoles = payload;
		updateUIRolesSelection();
	});
	socket.onReceiveEvent("GAME_END", function(payload){
		console("GAME END, WINNER IS THE " + (payload.winner == 1 ? "EVIL" : "GOOD") + " FACTION");
	});
	socket.onReceiveEvent("EMIT", function(payload){
		data = payload;
		console.log(data);
		updateUIQuestMap(data);
	});
	socket.onReceiveEvent("GAME_START", function(payload){
		socket.sendEvent("EMIT", 1);
		$("#selecting_roles").addClass("hidden");
		$("#game-frame").removeClass("hidden");
	});

	var $r = $(".role.template");
	roletemplate = $r.removeClass("template").parent().html();
	$r.parent().html("");

	switch(initializingState){
		case GameState.selecting_roles:
			$("#selecting_roles").removeClass("hidden");
			$("#game-frame").addClass("hidden");
			updateUIRolesSelection();
			break;
		default:
			$("#selecting_roles").addClass("hidden");
			$("#game-frame").removeClass("hidden");
			socket.sendEvent("EMIT", 1);
			break;
	}
});


function updateUIRolesSelection(){
	var plen = Object.keys(backend_players).length;
	var distribution = []; //0:good, 1:evil
	if (plen in rolesCount.distribution){
		distribution = rolesCount.distribution[plen];
	}else if(plen < 5){
		distribution = rolesCount.distribution[5];
	}
	$("#good ul").html("");
	$("#evil ul").html("");
	for (var i = 0; i < distribution[0]; i++){
		$("#good ul").append(roletemplate);
	}
	for (var i = 0; i < distribution[1]; i++){
		$("#evil ul").append(roletemplate);
	}

	var goods = $("#good .role");
	var goodInd = 0;
	var evils = $("#evil .role");
	var evilInd = 0;

	for(var i in availableRoles){
		var r = availableRoles[parseInt(i)];
		if (r in rolesCount){
			if (rolesCount[r].alignment == 0){
				// good
				$(goods[goodInd]).find("img").attr("src", roles[r].img);
				goodInd += 1;
			}else{
				//evil
				$(evils[evilInd]).find("img").attr("src", roles[r].img);
				evilInd += 1;
			}
		}
	}
}

function updateUIQuestMap(data){
	var quests = $(".quest");
	for(var i = 0; i < 5; i++){
		if (data.quest_results[i] > 0){
			$(quests[i]).addClass("fail");
		}else if(data.quest_results[i] < 0){
			$(quests[i]).addClass("pass");
		}

		var val = data.all_quests[i];
		if (val < 0){
			val = (-1*val) + "*";
		}
		$(quests[i]).find("h1").html(val);
	}
	var k = 0;
	var rejects = $(".reject");
	while (k < data.num_rejects){
		$(rejects[k]).addClass("fill");
		k += 1;
	}
}