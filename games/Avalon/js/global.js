var GameState = {
	selecting_roles: -1,
	king: 0,
	vote: 1,
	quest: 2
}
var roles = {
	Merlin: {
		description: "You know all evils except Mordred",
		count: 1,
		img: "http://i.imgur.com/j5PRT7G.png"
	},
	Assassin: {
		description: "You may assasinate a person at the end of the game, if this person is Merlin, evils win.",
		count: 1,
		img: "https://www.wired.com/wp-content/uploads/blogs/geekdad/wp-content/uploads/2012/07/Assassin-card.jpg"
	},
	Percival: {
		description: "You know the Merlins (one of them is Morgana)",
		count: 0,
		img: "http://i.imgur.com/nCNxgKJ.png",
	},
	Morgana: {
		description: "You appear as Merlin, confusing Percival.",
		count: 0,
		img: "http://i.imgur.com/NtzlpDs.png"
	},
	Oberon: {
		description: "You are unknown to all except Merlin",
		count: 0,
		img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7v55OhSEPT4HxIKVnSIGeQCbIuNKOp9FC1rjX_-yGjk3yXhUl"
	},
	Mordred: {
		description: "You are unknown to Merlin",
		count: 0,
		img: "http://masteryeti.no-ip.biz/resistance/gui/images/Mordred.png"
	},
	Servant: {
		description: "Servant of Merlin",
		count: 0,
		img: [
			"http://i.imgur.com/rYzEqqC.png",
			"http://i.imgur.com/1Cc1liX.png",
		]
	},
	Minion: {
		description: "Minion of Mordred",
		count: 0,
		img: [
			"http://i.imgur.com/c8uPuTU.png"
		]
	}
}