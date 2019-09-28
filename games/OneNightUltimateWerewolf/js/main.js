var data;
$(document).ready(function(){
	socket = new MTSocket("main");
	socket.onReceiveEvent("EMIT", function(payload){
		data = payload;
	});
	socket.onReceiveEvent("ROLES_SELECT", function(payload){
		console.log(payload);
		role_select = payload;
		UIUpdateRoles(role_select);
	});
	socket.onReceiveEvent("TIMER", function(payload){
		var string = parseInt(payload / 60) + ":" + (payload % 60)
		$("#timer .time_left").html(string);
		if (payload <= 30) {
			$("#timer").addClass("red");
		}
	});


	for (key in rolesData) {
		if (!rolesData[key].max) rolesData[key].max = rolesData.default.max;
		if (!rolesData[key].min) rolesData[key].min = rolesData.default.min;
		if (!rolesData[key].step) rolesData[key].step = rolesData.default.step;
		// if (!rolesData[key].win) rolesData[key].win = rolesData.default.win;
		// if (!rolesData[key].power) rolesData[key].power = rolesData.default.power;
	}

	templates.role_select = $(".template.role-item").html();
	UIUpdateRoles(role_select);
});


var templates = {}

function UIUpdateRoles(role_select){
	var $ul = $("#role-frame");
	$ul.html("");

	for (key in role_select) {
		if (role_select[key] > 0){
			$ul.append(templates.role_select);
			var $li = $ul.find(".role-item:last");
			$li.find(".counter").html(role_select[key]);
			$li.find("img").attr('src', rolesData[key].img);
			if (rolesData[key].power){
				$li.find(".power").html(rolesData[key].power);
			} else {
				$li.find(".power").closest(".block").addClass("hidden");
			}
			if (rolesData[key].win){
				$li.find(".win").html(rolesData[key].win);
			} else {
				$li.find(".win").closest(".block").addClass("hidden");
			}
		}
	}

	$("#top-info .village.win").html(rolesData.default.win);
	$("#top-info .werewolf.win").html(rolesData[roles.wolf].win);
	$("#top-info .minion.win").html(rolesData[roles.minion].win);
}