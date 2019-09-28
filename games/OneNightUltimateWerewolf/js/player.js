var print = console.log;
var data;
var players = {}; // indexed by id
var player; // self
var chats;
var socket;
var last_chat_length = 0;
var role_select = {}; // indexed by role string, number of thing

$(document).ready(function(){
	socket = new MTSocket("player");
	socket.onReceiveEvent("EMIT", function(payload){
		print(payload);
		data = payload;
		$.each(data.players, (i, p) => {players[p.id] = p;});
		player = players[myID];

		UIUpdateViewCards();

		$("#game-select .player_count").html(data.players.length);

		if (payload.gameState < GameState.role_reveal) {
			$("#game-frame").addClass("hidden");
			if (data.players[myID].ishost) $("#game-select").removeClass("hidden");
		} else {
			$("#game-frame").removeClass("hidden");
			$("#game-select").addClass("hidden");
		}
	});
	socket.onReceiveEvent("CHATS", function(payload){
		chats = payload;
		UIUpdateChats();
		UIUpdateViewCards();
		if (chats.length != last_chat_length){
			var obj = $("#game-frame")[0];
			obj.scrollTop = obj.scrollHeight;
			last_chat_length = chats.length;
		}
	});
	socket.onReceiveEvent("TIMER", function(payload){
		$("#timer").removeClass("hidden");
		var string = parseInt(payload / 60) + ":" + (payload % 60)
		$("#timer .time_left").html(string);
		if (payload <= 30) {
			$("#timer .time_left").addClass("red");
		}
	});

	// fix rolesData
	for (key in rolesData) {
		if (!rolesData[key].max) rolesData[key].max = rolesData.default.max;
		if (!rolesData[key].min) rolesData[key].min = rolesData.default.min;
		if (!rolesData[key].step) rolesData[key].step = rolesData.default.step;
	}

	UIInitTemplates();
	UIUpdateRoleSelect();
});

var templates = {};
function UIInitTemplates(){
	templates.role_select = $(".template.role-select").html();

	templates.chat_announcer = $(".template.chat.announcer").html();
	templates.chat_player = $(".template.chat.player").html();
	templates.chat_text = $(".template.chat.text").html();
	templates.chat_img = $(".template.chat.img").html();

	templates.ok_btn = $(".template.ok").html();
	templates.reveal_center = $(".template.reveal-center").html();
	templates.reveal_player = $(".template.reveal-player").html();
	templates.reveal_player_entry = $(".template.reveal-player-entry").html();
}

function UIUpdateRoleSelect(){
	var keys = Object.keys(rolesData);
	var $ul = $("#game-select ul");
	$ul.html("");
	$.each(keys, (i, key) => {
		if (key != "default"){
			if (!("enabled" in rolesData[key]) || rolesData[key].enabled){
				role_select[key] = 0;
				$ul.append(templates.role_select);
				var $li = $ul.find(".role-card:last");
				$li.find("img").attr("src", rolesData[key].img);
				$li.find(".info").attr("onclick", "clickRoleSelect(this,'"+key+"', false)");
				$li.attr("onclick", "clickRoleSelect(this,'"+key+"', true)");

				while (role_select[key] < roleSelect[key]){
					manageRoleSelect($li[0], key, true);
				}
			}
		}
	});

}

function UIUpdateViewCards(){
	if (player.view.center.length > 0) {
		var $center = $("#chat-window .choice.center .role-card");
		for (var i = 0; i < player.view.center.length; i++){
			var index = player.view.center[i];
			var url = rolesData[data.rolesCenter[index]].img;
			$($center[index]).css({"background-image": "url('"+url+"')"});
		}
	}

	if (player.view.player.length > 0) {
		for (var i = 0; i < player.view.player.length; i++){
			var index = player.view.player[i];
			var url = rolesData[players[index].role[0]].img;
			var $card = $("#chat-window .choice.players .role-card[name='"+players[index].name+"']");
			$card.css({"background-image": "url('"+url+"')"});
		}
	}

	if (player.role[0] == roles.robber && player.swap.length == 2) {
		var $card = $("#chat-window .choice.players .role-card[name='"+players[player.swap[1]].name+"']");
		$card.css({"background-image": "url('"+rolesData[roles.robber].img+"')"});
	}

	if (player.role[0] == roles.drunk && player.swap.length == 1) {
		var $card = $($("#chat-window .choice.center .role-card")[player.swap[0]]);
		$card.css({"background-image": "url('"+rolesData[roles.drunk].img+"')"});
	}
}

function UIUpdateChats(){
	var $ul = $("#chat-entries");
	$ul.html("");
	$.each(chats, (i, chat) => {
		if (chat.side != -1){
			// not action
			if (chat.side == 0) $ul.append(templates.chat_announcer);
			if (chat.side == 1) $ul.append(templates.chat_player);

			var $texts = $ul.find("li:last .text-entries");

			$.each(chat.texts, (j, text) => {
				if (text.text) {
					$texts.append(templates.chat_text);
					var $txt = $texts.find(".text:last");
					if (j == 0) $txt.addClass("top");
					if (j == chat.texts.length - 1) $txt.addClass("bottom");
					$txt.find("p").html(text.text);
				} else if (text.img){
					$texts.append(templates.chat_img);
					$texts.find("img:last").attr("src", text.img);
				}
			});
		} else {
			// action
			if (chat.type == "ok") { 
				var next_state = chat.next_state == false ? false : true;
				if (chat.pending) {
					$ul.append(templates.ok_btn);
					$ul.find("button:last").attr("onclick", "sendConfirm(this, " + next_state + ")");
				}
			} 
			if (chat.type == "reveal-both" || chat.type == "reveal-center" || chat.type == "swap-center") {
				$ul.append(templates.reveal_center);
				var $card = $ul.find(".choice.center:last .role-card");
				if (chat.type == "swap-center") $card.attr("onclick", (i) => "swapPlayerRoles(this, "+i+")");
				if (!chat.pending) $card.attr("onclick", "");
			} 
			if (chat.type == "reveal-both" || chat.type == "swap-player" || chat.type == "rob-player") {
				$ul.append(templates.reveal_player);
				var $reveal_player = $ul.find(".players:last");
				$.each(data.players, (k, p) => {
					if (p.id != myID) {
						$reveal_player.append(templates.reveal_player_entry);
						var $entry = $reveal_player.find(".role-card:last");
						$entry.html(p.name);
						$entry.attr("name", p.name);
						if (chat.type == "reveal-both") $entry.attr("onclick", "revealPlayerRole(this, "+p.id+")");
						if (chat.type == "swap-player") $entry.attr("onclick", "swapPlayerRoles(this, "+p.id+")");
						if (chat.type == "rob-player") $entry.attr("onclick", "swapPlayerRoles(this, "+p.id+")");
						
						if (!chat.pending) $entry.attr("onclick", "");
					}
				});
			}
			if (chat.type == "final-reveal") {
				if (chat.pending) {
					$ul.append(templates.ok_btn);
					$ul.find("button:last").addClass("btn-warning").attr("onclick", "sendReveal(this)");
					$ul.find("button:last h4").html("REVEAL");
				}
			}
			if (chat.type == "restart") {
				if (chat.pending) {
					$ul.append(templates.ok_btn);
					$ul.find("button:last").removeClass("btn-success").addClass("btn-danger").attr("onclick", "socket.restartGame(this)");
					$ul.find("button:last h4").html("RESTART GAME");
				}
			}
		}
	});
}

function clickRoleSelect(obj, role, add){
	if (this.event){
		this.event.stopPropagation();
	    this.event.cancelBubble = true;
	}
	manageRoleSelect(obj, role, add);
	sendRoles(false);
}
function manageRoleSelect(obj, role, add){
	// Update card UI
	if (add) {
		role_select[role] += rolesData[role].step;
		$(obj).removeClass("none");
	} else {
		if (role_select[role] > 0) {
			role_select[role] -= rolesData[role].step;
		}
	}

	if (role_select[role] > rolesData[role].max) role_select[role] = rolesData[role].max
	if (role_select[role] < rolesData[role].min) role_select[role] = rolesData[role].min
	if (role_select[role] == 0) $(obj).closest(".role-card").addClass("none");
	$(obj).find(".count").html(role_select[role]);

	// Update info and button UI
	var count = 0;
	for(key in role_select){ count += role_select[key]; }

	$("#game-select .role_count").html(count);
	if (data && count == data.players.length + 3) {
		$("#game-select .role_count").addClass("good").removeClass("bad");
		$("#game-select button").attr("disabled", false);
	} else {
		$("#game-select .role_count").addClass("bad").removeClass("good");
		$("#game-select button").attr("disabled", true);
	}
}
function sendRoles(complete){
	var payload = {
		role_select: role_select,
		complete: complete 
	};
	socket.sendEvent("PLAYER_ROLES", payload);
}

function toggleHideMask(show){
	if (show) $("#hide-mask").removeClass("hidden");
	else $("#hide-mask").addClass("hidden");
}

function revealCenterRole(btn, index){
	if (player.role[0] == roles.wolf && player.view.center.length < 1){
		player.view.center.push(index);
		socket.sendEvent("PLAYER_WOLF", player.view);
	} else if (player.role[0] == roles.seer && player.view.center.length < 2 && player.view.player.length == 0){
		player.view.center.push(index);
		socket.sendEvent("PLAYER_SEER", player.view);
	}
}
function revealPlayerRole(btn, pID){
	if (player.role[0] == roles.seer && player.view.player.length < 1 && player.view.center.length == 0) {
		player.view.player.push(pID);
		socket.sendEvent("PLAYER_SEER", player.view);
	}
}

function swapPlayerRoles(obj, pID){
	if (player.role[0] == roles.trouble){
		if (player.swap.length < 2 && player.swap.indexOf(pID) < 0) player.swap.push(pID);
		if (player.swap.length == 2) socket.sendEvent("PLAYER_TROUBLE", player.swap);

	} else if (player.role[0] == roles.robber) {
		socket.sendEvent("PLAYER_ROBBER", pID);
	} else if (player.role[0] == roles.drunk) {
		socket.sendEvent("PLAYER_DRUNK", pID);
	}
}

function sendConfirm(obj, next_state){
	$(obj).addClass("hidden");
	socket.sendEvent("PLAYER_CONFIRM", next_state);
}
function sendReveal(obj) {
	$(obj).addClass("hidden");
	socket.sendEvent("PLAYER_REVEAL_ROLES", 1);	
}
