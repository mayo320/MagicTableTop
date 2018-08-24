// Socket - on client side

var MTSocket = function(soc_type){
	var socket = io("/"+soc_type);

	this.onReceiveEvent = function(event, callback){
		socket.on(event, (payload) => callback(payload));
	}

	this.sendEvent = function(event, payload){
		socket.emit(event, payload);
	}
}