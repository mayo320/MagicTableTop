var GameState = {
	selecting_roles: -1,
	king: 0,
	vote: 1,
	quest: 2,
	assassinate: 3,
	end: 4
}
var roles = {
	Merlin: {
		alignment: 0,
		description: "You know all evils except Mordred",
		img: "http://i.imgur.com/j5PRT7G.png"
	},
	Assassin: {
		alignment: 1,
		description: "You may assasinate a person at the end of the game, if this person is Merlin, evils win.",
		img: "https://www.wired.com/wp-content/uploads/blogs/geekdad/wp-content/uploads/2012/07/Assassin-card.jpg"
	},
	Percival: {
		alignment: 0,
		description: "You know the Merlins (one of them is Morgana)",
		img: "http://i.imgur.com/nCNxgKJ.png",
	},
	Morgana: {
		alignment: 1,
		description: "You appear as Merlin, confusing Percival.",
		img: "http://i.imgur.com/NtzlpDs.png"
	},
	Oberon: {
		alignment: 1,
		description: "You are unknown to all except Merlin",
		img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7v55OhSEPT4HxIKVnSIGeQCbIuNKOp9FC1rjX_-yGjk3yXhUl"
	},
	Mordred: {
		alignment: 1,
		description: "You are unknown to Merlin",
		img: "https://ksr-ugc.imgix.net/assets/000/112/218/8dfe4717dc52b024fbf20b9f73ff788e_original.jpg?ixlib=rb-2.1.0&w=680&fit=max&v=1344901092&auto=format&gif-q=50&q=92&s=e535386704746ee2466c397c6051671f"
	},
	Servant: {
		alignment: 0,
		description: "Servant of Merlin",
		img: [
			"http://i.imgur.com/rYzEqqC.png",
			"http://i.imgur.com/1Cc1liX.png",
		]
	},
	Minion: {
		alignment: 1,
		description: "Minion of Mordred",
		img: [
			"http://i.imgur.com/c8uPuTU.png"
		]
	}
}