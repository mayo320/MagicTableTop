var print = console.log;
var socket;
var currency = [
	{
		img: "https://i.imgur.com/eitlUgF.jpg"
	},
	{
		img: "https://i.imgur.com/wGRgzus.jpg"
	},
	{
		img: "https://i.imgur.com/joDax0e.jpg"
	},
	{
		img: "https://i.imgur.com/FkNJi2s.jpg"
	},
	{
		img: "https://i.imgur.com/KLrP95l.jpg"
	},
];
var players = [
	{
		name: "Jack",
		vp: 2,
		settlers: 1,
		currency: [
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
		]
	},
	{
		name: "Bran",
		vp: 1,
		settlers: 0,
		currency: [
			{perm:2, fluid:1},
			{perm:0, fluid:1},
			{perm:6, fluid:1},
			{perm:0, fluid:1},
			{perm:2, fluid:1},
		]
	},
	{
		name: "Sal",
		vp: 2,
		settlers: 1,
		currency: [
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:2, fluid:1},
			{perm:0, fluid:1},
			{perm:8, fluid:1},
		]
	},
	{
		name: "Farhat",
		vp: 2,
		settlers: 99,
		currency: [
			{perm:0, fluid:23},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
			{perm:0, fluid:1},
		]
	}
];
var card_backgrounds = [
	"https://i.imgur.com/zjESCeZ.jpg",
	"https://i.imgur.com/KIjjoVe.jpg",
	"https://i.imgur.com/pgid27X.jpg",
	"https://i.imgur.com/POh96lW.jpg",
	"https://i.imgur.com/u5GPs5q.jpg",
]
var board = [
	[
		{vp: 0, grant: 2, bg: 1, cost:[2,1,1,0,1]},
		{vp: 1, grant: 0, bg: 0, cost:[0,1,2,0,1]},
		{vp: 0, grant: 1, bg: 2, cost:[0,0,4,0,0]},
		{vp: 0, grant: 3, bg: 4, cost:[0,1,3,0,1]},
	],
	[
		{vp: 2, grant: 4, bg: 3, cost:[0,1,4,0,1]},
		{vp: 3, grant: 1, bg: 2, cost:[1,1,1,6,1]},
		{vp: 4, grant: 2, bg: 1, cost:[0,1,1,0,1]},
		{vp: 2, grant: 4, bg: 1, cost:[0,1,1,0,1]},
	],
	[
		{vp: 2, grant: 2, bg: 0, cost:[0,1,5,7,1]},
		{vp: 1, grant: 0, bg: 0, cost:[2,1,1,0,1]},
		{vp: 6, grant: 0, bg: 3, cost:[0,1,1,0,1]},
		{vp: 2, grant: 1, bg: 4, cost:[0,1,1,0,1]},
	]
];

var playerUITemplate = "";
var cardUITemplate = "";

$(document).ready(function(){
	socket = new MTSocket("main");

	playerUITemplate = getPlayerUITemplate();
	updatePlayerUI(playerUITemplate);

	cardUITemplate = getCardUITempalte();
	updateBoardUI(cardUITemplate);
});

function getPlayerUITemplate(){
	return $("#pdata-0").html();
}
function updatePlayerUI(template){
	for(var i in players){
		var p = players[i];
		var $p = $("#pdata-"+i);
		$p.html(template);
		$p.find(".info-name").html(p.name);
		$p.find(".info-vp").html(p.vp);
		$p.find(".info-settlers").html(p.settlers);

		var $curr_perm = $p.find(".curr-perm");
		var $curr_fluid = $p.find(".curr-fluid");
		for (var j in p.currency){
			var c = p.currency[j];
			$($curr_perm).html(c.perm);
			$($curr_fluid).html(c.fluid);
		}
		$p.removeClass("hidden");
	}
}

function getCardUITempalte(){
	return $($(".sCard.playable")[0]).html();
}
function updateTierCardsUI(tier, cTemplate){
	var $cards = $("#card-t"+tier+" .sCard.playable");
	for (var i in board[tier-1]){
		var card = board[tier-1][i];
		$($cards[i]).html(cTemplate);
		// update card BG
		$($cards[i]).find(".bg").attr("src", card_backgrounds[card.bg]);
		// update card VP
		if(card.vp == 0){
			$($cards[i]).find(".vp").addClass("hidden");
		}else{
			$($cards[i]).find(".vp").removeClass("hidden").html(card.vp);
		}
		// update card granting bonus
		$($cards[i]).find(".grant").attr("src", currency[card.grant].img);
		// update the cost bubbles
		$costs = $($cards[i]).find(".cost-cont>div");
		for (var j in card.cost){
			var c = card.cost[j];
			if (c == 0){
				$($costs[j]).addClass("hidden");
			}else{
				$($costs[j]).removeClass("hidden").find("img").attr("src", currency[j].img);
				$($costs[j]).find(".cost").html(c);
			}
		}
	}
}
function updateBoardUI(cTemplate){
	updateTierCardsUI(1, cTemplate);
	updateTierCardsUI(2, cTemplate);
	updateTierCardsUI(3, cTemplate);
}

function playerPickUpCard(playerID, tier, index){
	var imgs = $("#card-t"+tier+" .sCard.playable .bg");
	if (index < imgs.length){
		var imgObj = imgs[index];
		animCardToPlayer(imgObj, playerID);
		setTimeout(() => {
			animFillCardSlotFromDeck(imgObj, tier);
		}, 1200);
	}

}

function animCardToPlayer(imgObj, playerID){	
	var $card = $(imgObj).closest(".sCard.playable");
	var imgObjRect = imgObj.getBoundingClientRect();
	var origin = {
		x: imgObjRect.x,
		y: imgObjRect.y,
	};
	var p = $("#pdata-"+playerID)[0];
	var pRect = p.getBoundingClientRect();
	var dest = {
		x: pRect.x + (pRect.width / 2),
		y: pRect.y + (pRect.height / 2)
	};

	var h = $(imgObj).height();
	var w = $(imgObj).width();
	var origPosition = $(imgObj).css("position");
	$(imgObj).css({
		height: h + "px",
		width: w + "px",
		position: "fixed",
		"z-index": "5"
	});
	var delay = 0;
	// Enlarge
	$(imgObj).animate({
		height: (h * 1.2) + "px",
		width: (w * 1.2) + "px",
		"margin-left": (w * -0.1) + "px",
		"margin-top": (h * -0.1) + "px",
	}, 500);
	delay += 500;
 	// Move to player
	setTimeout(() => {
		$(imgObj).animate({
			left: dest.x + "px",
			top: dest.y + "px",
			width: "0px",
			height: "0px"
		}, 500);
	}, delay);
	delay += 500;
	// Restore original css
	setTimeout(() => {
		$(imgObj).css({
			position: origPosition,
			width: "100%",
			height: "auto",
			left: "auto", top: "auto",
			"margin-left": 0, "margin-top": 0,
			"opacity" : "0"
		});
		$card.css({
			"opacity" : "0"
		})
	}, delay + 100)
}

function animFillCardSlotFromDeck(imgObj, tier, callback){
	$(imgObj).css("opacity", "0");
	var $card = $(imgObj).closest(".sCard.playable");
	$card.css("opacity", "0");

	var deckHasMoreCard = true;

	var $tier = $("#card-t"+tier);
	var $backdeck = $tier.find(".backdeck");
	var $deckImg = $tier.find(".backdeck img");
	var pRect = $deckImg[0].getBoundingClientRect();
	var origin = {
		x: pRect.x,
		y: pRect.y
	};

	var imgObjRect = imgObj.getBoundingClientRect();
	var dest = {
		x: imgObjRect.x + ((imgObjRect.width- pRect.width) / 2),
		y: imgObjRect.y + ((imgObjRect.height- pRect.height) / 2),
	};

	var origHtml = $backdeck.html();
	if (deckHasMoreCard) $backdeck.html(origHtml + origHtml); // only if theres more cards in the deck
	$deckImg = $backdeck.find("img:first");


	var h = $deckImg.height();
	var w = $deckImg.width();
	$deckImg.css({
		height: h + "px",
		width: w + "px",
		position: "fixed",
		"z-index": "5"
	});
	$deckImg.animate({
		left: dest.x + "px",
		top: dest.y + "px"
	}, 500)
	setTimeout(() => {
		$deckImg.animate({
			opacity: "0"
		}, 500);

		// $(imgObj).attr("src"); // Set to new card img
		$(imgObj).animate({
			opacity: "1"
		}, 500);
		$card.animate({
			opacity: "1"
		}, 500);

	}, 500);
	setTimeout(() => {
		if (deckHasMoreCard) $backdeck.html(origHtml);
		else $backdeck.html("");
	}, 1000);
}