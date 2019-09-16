var print = console.log;
var data;
var players = {}; // indexed by id
var player; // self
var chats;
var socket;
var last_chat_length = 0;

$(document).ready(function(){
	socket = new MTSocket("player");
	socket.onReceiveEvent("EMIT", function(payload){
		print(payload);
		data = payload;
		$.each(data.players, (i, p) => {players[p.id] = p;});
		player = players[myID];

		UIUpdateViewCards();
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

	UIInitTemplates();
});


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

var templates = {};
function UIInitTemplates(){
	templates.chat_announcer = $(".template.chat.announcer").html();
	templates.chat_player = $(".template.chat.player").html();
	templates.chat_text = $(".template.chat.text").html();
	templates.chat_img = $(".template.chat.img").html();

	templates.ok_btn = $(".template.ok").html();
	templates.reveal_center = $(".template.reveal-center").html();
	templates.reveal_player = $(".template.reveal-player").html();
	templates.reveal_player_entry = $(".template.reveal-player-entry").html();
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
				if (chat.pending) $ul.append(templates.ok_btn);
				$ul.find("button:last").attr("onclick", "sendConfirm(this, " + next_state + ")");
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
		}
	});
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
