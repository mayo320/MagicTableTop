// Socket - on client side

var MTSocket = function(soc_type){
	var socket = io("/"+soc_type);

	socket.on("ev-restartgame", (payload) => {
		console.log("Restarting game...");
		location.reload();
	});
	socket.on("ev-returnhome", (url) => {
		console.log("Returning home...");
		window.location.href = url;
	});

	this.onReceiveEvent = function(event, callback){
		socket.on(event, (payload) => callback(payload));
	}

	this.sendEvent = function(event, payload){
		socket.emit(event, payload);
	}

	this.restartGame = function(){
		console.log("Requesting server to restart game...");
		socket.emit("ev-restartgame", true);
	}
	this.returnHome = function(){
		console.log("Requesting to return home");
		socket.emit("ev-returnhome", true);
	}
}