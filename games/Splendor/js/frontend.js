var print = console.log;
var socket;
var gameManager;
var currency_ind = {
	ruby: 0, sapphire: 1, diamond: 2, emerald: 3, onyx: 4, token: 5
}
var currency = [
	{
		name: "ruby",
		remaining: 7,
		img: "https://i.imgur.com/lttA91k.jpg"
	},
	{
		name: "sapphire",
		remaining: 7,
		img: "https://i.imgur.com/CSNE8h9.jpg"
	},
	{
		name: "diamond",
		remaining: 7,
		img: "https://i.imgur.com/jSMMqhC.jpg"
	},
	{
		name: "emerald",
		remaining: 7,
		img: "https://i.imgur.com/hnRUdQC.jpg"
	},
	{
		name: "onyx",
		remaining: 7,
		img: "https://i.imgur.com/Vk7mn1E.jpg"
	},
	{
		name: "token",
		remaining: 5,
		img: "https://i.imgur.com/qVKEYeN.jpg"
	},
];
var players = [
	{
		name: "Jack",
		vp: 2,
		settlers: 1,
		reserved: [],
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
		reserved: [],
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
		reserved: [],
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
		reserved: [],
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
		{vp: 0, grant: 3, bg: 4, cost:[0,1,1,0,1]},
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
var currencyPoolUITemplate = "";

$(document).ready(function(){
	socket = new MTSocket("main");
	gameManager = new GameManager();

	playerUITemplate = getPlayerUITemplate();
	updatePlayerUI(playerUITemplate);

	cardUITemplate = getCardUITempalte();
	updateBoardUI(cardUITemplate);

	currencyPoolUITemplate = getCurrPoolUITemplate();
	updateCurrPoolUI(currencyPoolUITemplate);
});


// UI FUNCTIONS
function getPlayerUITemplate(){
	var $temp = $("#pdata-0");
	$temp.find(".container img").attr("src", function(){
		var i = currency_ind[$(this).attr("name")];
		return currency[i].img;
	})
	return $temp.html();
}
function updatePlayerUI(template){
	template = typeof template == "undefined" ? playerUITemplate : template;
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
			$($curr_perm[j]).html(c.perm);
			$($curr_fluid[j]).html(c.fluid);
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
	cTemplate = typeof cTemplate == "undefined" ? cardUITemplate : cTemplate;
	updateTierCardsUI(1, cTemplate);
	updateTierCardsUI(2, cTemplate);
	updateTierCardsUI(3, cTemplate);
}

function getCurrPoolUITemplate(){
	return $("#currency-pool .template").removeClass("template").html();
}
function updateCurrPoolUI(cpTemplate){
	cpTemplate = typeof cpTemplate == "undefined" ? currencyPoolUITemplate : cpTemplate;
	var $currs = $("#currency-pool>div");
	for (var i = 0; i < $currs.length; i++){
		var c = $currs[i];
		var currname = $(c).find("img").attr("name");
		$(c).html(cpTemplate);
		var curInfo = currency[currency_ind[currname]];
		$(c).find("img").attr("name", currname).attr("src", curInfo.img);
		$(c).find(".overlay .remaining").html(curInfo.remaining);
		if (curInfo.remaining <= 0){
			$(c).css("opacity", "0.4");
		}else{
			$(c).css("opacity", "1");
		}
	}
}

// ACTION FUNCTIONs
function playerPickUpCard(playerID, tier, index, callback){
	var imgs = $("#card-t"+tier+" .sCard.playable .bg");
	if (index < imgs.length){
		var imgObj = imgs[index];
		animCardToPlayer(imgObj, playerID);
		setTimeout(() => {
			animFillCardSlotFromDeck(imgObj, tier);
		}, 1200);
	}

	if (typeof callback === "function"){
		setTimeout(function(p, t, i) {
			callback(p, t, i);
		}, 2300, playerID, tier, index);
	}

}

// ANIMATION FUNCTIONS
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

function animTokenToCard(tier, index, callback){
	var $currImg = $("#currency-pool img[name='token']");
	var tRect = $currImg[0].getBoundingClientRect();
	var origin = {
		x: tRect.x,
		y: tRect.y
	};

	var $cards = $("#card-t" + tier +" .sCard.playable");
	if (index < $cards.length){
		var $card = $($cards[index]);
		if (!$card.hasClass("reserved")){
			$card.addClass("reserved");
			var cRect = $card[0].getBoundingClientRect();
			var dest = {
				x: cRect.x + ((cRect.width - tRect.width) / 2),
				y: cRect.y + ((cRect.height - tRect.height) / 2)
			};

			// copy token img;
			var h = $currImg.height();
			var w = $currImg.width();
			$currImg.parent().prepend($currImg.clone());
			$currImg.css({
				position: "fixed", 
				height: h + "px",
				width: w + "px",
				left: origin.x + "px",
				top: origin.y + "px",
				"z-index": "5"
			});

			$card.find(".overlay img[name='token']").remove();
			$card.find(".overlay").append($currImg);

			$currImg.animate({
				left: dest.x + "px",
				top: dest.y + "px",
			}, 500);

			setTimeout(() => {
				$currImg.css({
					position: "absolute", left: 0, top: 0
				}).addClass("absolute-center");
			}, 600);

			if (typeof callback === "function"){
				setTimeout(function(c, p) {callback(c, p)}, 600, tier, index);
			}
		}
	}
}

function animCoinToPlayer(coin, playerID, callback){
	var $currImg = $("#currency-pool img[name='"+currency[coin].name+"']");
	var cRect = $currImg[0].getBoundingClientRect();
	var origin = {
		x: cRect.x,
		y: cRect.y
	};

	var p = $("#pdata-"+playerID + " img[name='" + currency[coin].name + "']");
	var pRect = p[0].getBoundingClientRect();
	var dest = {
		x: pRect.x,
		y: pRect.y
	};

	// copy coin img;
	var h = $currImg.height();
	var w = $currImg.width();
	$currImg.parent().prepend($currImg.clone());
	$currImg.css({
		position: "fixed", 
		height: h + "px",
		width: w + "px",
		left: origin.x + "px",
		top: origin.y + "px",
		"z-index": "5"
	});

	$currImg.animate({
		height: p.height() + "px",
		width: p.width() + "px",
		left: dest.x + "px",
		top: dest.y + "px",
	}, 500);

	setTimeout(() => {
		$currImg.remove();
	}, 500);

	if (typeof callback === "function"){
		setTimeout(function(c, p) {callback(c, p)}, 500, coin, playerID);
	}
}
function animCoinsToPlayer(coins, playerID, callback, endingCallback){
	// coins: list of int representing the currency
	// example: [0,2,1] --> move ruby, sapphire, diamond
	// example: [0,0] --> move ruby twice
	var delay = 0;
	for(var i in coins){
		setTimeout(function(i, p, c) {
			animCoinToPlayer(i, p, c);
		}, delay, coins[i], playerID, callback);
		delay += 600;
	}
	if (typeof endingCallback === "function"){
		setTimeout(endingCallback, delay + 100);
	}
}

function CHEATERALERT(playerID){
	console.log("player " + players[playerID].name + " cheated!");
}

// GAME MANAGER
var GameManager = function(){
	this.currentTurnID = -1; // represents the playerID of current turn's player
	this.totalTurns = 0;

	this.nextTurn = function(){
		this.totalTurns += 1;
		$("#pdata-"+this.currentTurnID).removeClass("current-turn");
		this.currentTurnID += 1;
		this.currentTurnID = this.currentTurnID < players.length ? this.currentTurnID : 0;
		$("#pdata-"+this.currentTurnID).addClass("current-turn");
		this.playerTurn(this.currentTurnID);
	}
	this.playerTurn = function(playerID){
		// Tell player that it's their turn, now wait for action from player.
	}
	this.onReceivePlayerAction = function(actionType, actionData){
		// This func is called when user performs an action
		switch (actionType){
			case "PICK_COIN":
				var delay = 0;
				var coins = actionData.coins
				for(var i in coins){
					setTimeout(function(i, p, callback) {
						currency[i].remaining -= 1;
						players[p].currency[i].fluid += 1;
						updateCurrPoolUI();
						animCoinToPlayer(i, p, callback);
					}, delay, coins[i], actionData.playerID, 
					function(coin, playerID){
						updatePlayerUI();
					});
					delay += 600;
				}
				break;
			case "PICK_CARD":
				var card = board[actionData.tier-1][actionData.index];
				var p = players[actionData.playerID];
				var boughtReserve = -1;

				if (p.reserved.length > 0){
					if (0 == p.reserved.reduce((accu, cur) => accu |= (cur.tier == actionData.tier && cur.tier == actionData.index), false))
						break;
				}

				var affordable = true;
				var checked = false;
				for (var k = 0; k < 2; k++){
					for(var i in players[actionData.playerID].currency){
						var cost = card.cost[i];
						cost -= p.currency[i].perm;
						cost = cost < 0 ? 0 : cost;
						affordable &= p.currency[i].fluid - cost >= 0;
						if (checked && affordable) {
							p.currency[i].fluid -= cost;
							currency[i].remaining += cost;
						}
					}
					checked = true;
				}
				if (affordable){
					if (boughtReserve >= 0){
						p.reserved.splice(boughtReserve, 1);
						$($("#card-t" + actionData.tier +" .sCard.playable")[actionData.index]).removeClass("reserved");
					}
					
					p.currency[card.grant].perm += 1;

					playerPickUpCard(actionData.playerID, actionData.tier, actionData.index, 
						function(playerID, tier, index){
							updatePlayerUI();
							updateCurrPoolUI();
						});
				}
				break;
			case "RESERVE_CARD":
				var card = board[actionData.tier-1][actionData.index];
				var p = players[actionData.playerID];
				if ($($("#card-t" + actionData.tier +" .sCard.playable")[actionData.index]).hasClass("reserved")){
					break;
				}

				currency[currency_ind["token"]].remaining -= 1;
				updateCurrPoolUI();
				animTokenToCard(actionData.tier, actionData.index, function(tier, index){
				});

				break;
		}
	}
}

function s(i){
	switch(i){
		case -1:
			gameManager.onReceivePlayerAction("PICK_COIN", {coins:[0,0], playerID: 0});
			break;
		case 0:
			gameManager.onReceivePlayerAction("PICK_COIN", {coins:[4,2,1], playerID: 0});
			break;
		case 1:
			gameManager.onReceivePlayerAction("PICK_CARD", {playerID: 0, tier:1, index: 3});
			break;
		case 2:
			gameManager.onReceivePlayerAction("RESERVE_CARD", {playerID: 0, tier:2, index: 0});
			break;
	}
}
