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
	return $(".card.template").removeClass("template").html();
}
function updateTierUI(tier){
	$cards = $("#card-t" + tier + " .card");
	$cards.find(".vp").html(function(i){
		return board[tier-1][i].vp == 0 ? "" : board[tier-1][i].vp;
	});
	$cards.find(".grant").attr("src", function(i){
		return currency[board[tier-1][i].grant].img;				
	});
	$cards.find(".bg").attr("src", function(i){
		return card_backgrounds[board[tier-1][i].bg % card_backgrounds.length];
	});
}
function updateBoardUI(){
	$(".card").html(cardTemplate);
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
	})
}