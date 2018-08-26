var print = console.log;
var socket = new MTSocket("player");

var players;
var board;
var currency;
var card_backgrounds;
var deck;

var actionType = {
	none: -1,
	pick_card: 0,
	pick_coin: 1,
	reserve_card: 2
}
var action = actionType.none;
var picked_coins = [];
var picked_card = {};
var reserved_card = {};

socket.onReceiveEvent("BROADCAST", (payload) => {
	console.log("BROADCASTED", payload);
	players = payload.players;
	board = payload.board;
	currency = payload.currency;
	card_backgrounds = payload.card_backgrounds;
	deck = payload.deck;

	if (players[myID].currentturn){
		myTurn(true);
	}
	if (action == actionType.none || !players[myID].currentturn){
		updateBoardUI();
		updateCurrPoolUI();
	}
});
// socket.onReceiveEvent("PLAYER_TURN", (payload) => {
// 	myTurn();
// });
socket.onReceiveEvent("GAMEOVER", (payload) => {
	gameOver();
});
function gameOver(){
	$("#confirm-box").removeClass("hidden");
	$("#confirm-box .msg").html("Game over!");
	$("#confirm-box .content").html("Would you like to restart Splendor or return to the main menu?");
	$btns = $("#confirm-box .btns .btn");
	$($btns[0]).attr("onclick", "mainmenu()").find("h4").html("Home");
	$($btns[1]).attr("onclick", "restartgame()").find("h4").html("Restart");
}
function mainmenu(){
	socket.toMainMenu();
}
function restartgame(){
	socket.restartGame();
}

function myTurn(boo){
	if (boo) $("#not-your-turn").addClass("hidden");	
	else {
		action = actionType.none;
		$("#not-your-turn").removeClass("hidden");	
	}
}


var cardTemplate = "";
var currPoolTemplate = "";

$(document).ready(function(){
	cardTemplate = getCardUITemplate();
	currPoolTemplate = getCurrPoolTempalte();
});

function getCardUITemplate(){
	return $(".sCard.template").removeClass("template").html();
}
function updateTierUI(tier){
	$cards = $("#card-t" + tier + " .sCard");
	$cards.find(".vp").html(function(i){
		return board[tier-1][i].vp == 0 ? "" : board[tier-1][i].vp;
	});
	$cards.find(".grant").attr("src", function(i){
		return currency[board[tier-1][i].grant].img;				
	});
	$cards.find(".bg").attr("src", function(i){
		return card_backgrounds[board[tier-1][i].bg % card_backgrounds.length];
	});
	$.each($cards, function(i,o){
		if (canAffordCard(board[tier-1][i])){
			$(o).removeClass("disabled");
		}else{
			$(o).addClass("disabled");
		}
		$(o).attr("tier", tier);
		$(o).attr("index", i);
		$(o).attr("onclick", "buyCard(this)");
	});
}
function updateBoardUI(){
	$(".row .sCard").html(cardTemplate);
	for (var i in board){
		updateTierUI(parseInt(i)+1);
	}
}

function getCurrPoolTempalte(){
	return $(".currency.template").removeClass('template').html();
}
function updateCurrPoolUI(){
	$currs = $("#currency-pool .currency");
	$currs.html(currPoolTemplate);
	$currs.find("img").attr("src", function(){
		var currname = $(this).closest(".currency").attr("name");
		var curInfo = currency[currency_ind[currname]];
		return curInfo.img;
	});
}

function canAffordCard(card){
	var p = players[myID];
	var temp = card.cost.map((x,i) => (p.currency[i].perm + p.currency[i].fluid - x) >= 0);
	return temp.reduce((a,c) => a &= c, true);
}

function no(){
	$("#confirm-box").addClass('hidden');
	// action = actionType.none;
}
function yes(){
	var actionData = {
		playerID: myID
	}

	if (action == actionType.pick_card){
		actionData.tier = picked_card.tier;
		actionData.index = picked_card.index;
		socket.sendEvent("PICK_CARD", actionData);
		picked_card = {};
	}
	if (action == actionType.pick_coin){
		actionData.coins = picked_coins;
		socket.sendEvent("PICK_COIN", actionData);
		updateCurrPoolUI(); picked_coins = [];
	}
	if (action == actionType.reserve_card){
		actionData.tier = reserved_card.tier;
		actionData.index = reserved_card.index;
		socket.sendEvent("PICK_COIN", actionData);
		reserved_card = {};
	}

	$("#confirm-box").addClass('hidden');
	myTurn(false);
}

function buyCard(cardDom){
	var $c = $(cardDom);
	var tier = parseInt($c.attr("tier"));
	var index = parseInt($c.attr("index"));
	var card = board[tier-1][index];
	if(canAffordCard(card)){
		$("#confirm-box").removeClass('hidden');
		$("#confirm-box .msg").html("You want to buy this card?")
		$("#confirm-box .content").css({
			width: "70%", margin: "auto"
		}).html($c.clone().attr("onclick","").css("width","100%"));

		$("#confirm-box .sCard .overlay").append("<div class='costs'></div>");
		$costs = $("#confirm-box .sCard .overlay .costs");
		$.each(card.cost, function(i, cost){
			if(cost != 0){
				var html = "<div><div class='curr'><h3 class='cost'>";
				html += cost+"</h3><img src='"+currency[i].img+"'></div>";
				html += "<h3 class='actualcost'>"
				html += "-" + (players[myID].currency[i].perm >= cost ? 0 : cost - players[myID].currency[i].perm);
				html += "</h3></div>";
				$costs.append(html);
			}
		});

		action = actionType.pick_card;
		picked_card.tier = tier;
		picked_card.index = index;
	}
}

function pickCurr(currDom){
	var $c = $(currDom).parent();
	var currname = $c.attr("name");
	if(currname == "token") return;
	var currInd = (currency_ind[currname]);

	if (picked_coins.length == 2 && picked_coins[0] == picked_coins[1]) return;
	if (picked_coins.length == 2 && picked_coins.indexOf(currInd) >= 0) return;
	if (picked_coins.length == 3) return;
	if (currency[currInd].remaining <= 0) return;

	picked_coins.push(currInd);

	$c.find(".picked").addClass("selected");
	var $picked = $c.find(".picked h3");
	$picked.html(parseInt($picked.html()) + 1);
	currency[currInd].remaining -= 1;

	action = actionType.pick_coin;

	if ((picked_coins.length == 2 && picked_coins[0] == picked_coins[1]) || 
		(picked_coins.length == 3)){
		$("#confirm-box").removeClass('hidden');
		$("#confirm-box .msg").html("You will collect these currencies?");
		var html = "";
		$.each(picked_coins, function(i, curInd){
			html += "<div class='coin'><img src='"+ currency[curInd].img +"'></div>";
		});
		$("#confirm-box .content").html(html);
	}
}

function removeCurr(currDom){
	var $c = $(currDom).parent();
	var currname = $c.attr("name");
	if(currname == "token") return;
	var currInd = (currency_ind[currname]);

	picked_coins.splice(picked_coins.indexOf(currInd), 1);

	var $picked = $c.find(".picked h3");
	$picked.html(parseInt($picked.html()) - 1);
	currency[currInd].remaining += 1;
	if (parseInt($picked.html()) <= 0) {
		$c.find(".picked").removeClass("selected");
	}
	if (picked_coins.length == 0){
		action = actionType.none;
	}
}