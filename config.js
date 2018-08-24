// Config file

var config = {
	port: 7070,
	address: "0.0.0.0",
	games: [
		{
			name: "Splendor", // required - must match folder name inside "games" folder
			player_count: [2,4], // required - min and max player inclusive
			playtime: "20+ min", // required - string indicating playtime
			disabled: false, // optional

			config: [ // optional
			]
		},
		{
			name: "Catan", // required - must match folder name inside "games" folder
			player_count: [2,4], // required - min and max player inclusive
			playtime: "40+ min", // required - string indicating playtime
			disabled: false, // optional
			
			config: [ // optional
			]
		}
	]
};

module.exports = config;