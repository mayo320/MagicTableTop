var print = console.log;
var socket = new MTSocket("player");

var players;
var board;
var currency;
var card_backgrounds;
var deck;

socket.onReceiveEvent("BROADCAST", (payload) => {
	console.log("BROADCASTED", payload);
	players = payload.players;
	board = payload.board;
	currency = payload.currency;
	card_backgrounds = payload.card_backgrounds;
	deck = payload.deck;

	if (players[myID].currentturn){
		myTurn();
	}

	updateBoardUI();
	updateCurrPoolUI();
});
socket.onReceiveEvent("PLAYER_TURN", (payload) => {
	myTurn();
});
function myTurn(){
	print("my turn");
	$("#not-your-turn").addClass("hidden");	
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
	$currs = $("#currency-pool .currency").attr("onclick", "pickCurr(this)");
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
}
function yes(){
	var actionData = {
		playerID: myID
	}
	if(buycard){
		socket.sendEvent("PICK_CARD", actionData);
	}
}

function buyCard(cardDom){
	var $c = $(cardDom);
	var tier = $c.attr("tier");
	var index = $c.attr("index");
	var card = board[tier-1][index];
	if(canAffordCard(card)){
		$("#confirm-box").removeClass('hidden');
		$("#confirm-box .msg").html("You want to buy this card?")
		$("#confirm-box .content").css({
			width: "70%", margin: "auto"
		}).html($c.clone().css("width","100%"));

		$("#confirm-box .sCard .overlay").append("<div class='costs'></div>");
		$costs = $("#confirm-box .sCard .overlay .costs");
		$.each(card.cost, function(i, cost){
			if(cost != 0){
				var html = "<div><h3 class='cost'>";
				html += cost+"</h3><img src='"+currency[i].img+"'></div>"
				$costs.append(html);
			}
		})
	}
}

function pickCurr(currDom){
	var $c = $(currDom);
	var currname = $c.attr("name");
	$c.find(".picked").addClass("selected");
	var $picked = $c.find(".picked h3");
	$picked.html(parseInt($picked.html()) + 1);
}