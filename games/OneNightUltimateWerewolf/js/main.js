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


	for (key in rolesData) {
		if (!rolesData[key].max) rolesData[key].max = rolesData.default.max;
		if (!rolesData[key].min) rolesData[key].min = rolesData.default.min;
		if (!rolesData[key].step) rolesData[key].step = rolesData.default.step;
		if (!rolesData[key].win) rolesData[key].win = rolesData.default.win;
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
			$li.find(".power").html(rolesData[key].power);
			$li.find(".win").html(rolesData[key].win);
		}
	}
}