var Log = function(){
	var info 	= "[ INFO  ] ";
	var warning = "[WARNING] ";
	var error 	= "[ ERROR ] ";

	this.info = function(str){
		console.log(info + str);
	}

	this.warning = function(str){
		console.log(warning + str);
	}

	this.error = function(str){
		console.log(error + str);
	}

	this.getHash = function(){
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}
}

module.exports = new Log();