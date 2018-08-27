// Config file

var config = {
	port: 7070,
	address: "0.0.0.0",
	games: [
		{
			name: "Splendor", // required - must match folder name inside "games" folder
			disabled: false, // optional

			config: [ // optional
			]
		},
		{
			name: "Catan", // required - must match folder name inside "games" folder
			disabled: false, // optional
			
			config: [ // optional
			]
		},
		{
			name: "Pong", // required - must match folder name inside "games" folder
			disabled: false, // optional
			
			config: [ // optional
			]
		}
	]
};

module.exports = config;