$(document).ready(function () {

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyCp94eZm6CP06qCR_9u6K4k0zGOdUAdi8M",
		authDomain: "rps-multiplayer-22d89.firebaseapp.com",
		databaseURL: "https://rps-multiplayer-22d89.firebaseio.com",
		projectId: "rps-multiplayer-22d89",
		storageBucket: "",
		messagingSenderId: "1058287284562"
	};
	firebase.initializeApp(config);

	var database = firebase.database();

	var topGenfoSec = $(".top-gen-info-section");
	var btmGenfoSec = $(".bottom-gen-info-section")

	var p1nameSec = $(".player1-name-section");
	var p1btnSec = $(".player1-button-section");
	var p1statSec = $(".player1-status-section");

	var p2nameSec = $(".player2-name-section");
	var p2btnSec = $(".player2-button-section");
	var p2statSec = $(".player2-status-section");
	var matchInfo = $(".match-info");
	var chatHist = $(".chat-history");
	var p1inDb = false;
	var p2inDb = false;
	var p1Name = null;
	var p2Name = null;
	var isSpectator = false;

	var connectedRef = database.ref(".info/connected");
	var myDatabaseRef = null;

	/**
	 * play Rock Paper Scissors between p1 and p2.
	 * @returns 0 if tied, else return 1 if p1 wins, 2 if p2 wins.
	 * @param {String} p1 
	 * @param {String} p2 
	 */
	function playRPS(p1, p2) {
		if (p1 == p2) {
			return 0;
		}
		if (p1 === "rock") {
			if (p2 === "scissors") {
				return 1;
			}
			return 2;
		} else if (p1 === "paper") {
			if (p2 === "scissors") {
				return 2;
			}
			return 1;
		} else if (p1 === "scissors") {
			if (p2 === "paper") {
				return 1;
			}
			return 2;
		} else {
			console.error(`RPS error --> p1: ${p1} p2: ${p2}`);
		}
	}

	/**
	 * Clear the General Info section and display
	 * input to add new player.
	 */
	function displayAddUser() {
		topGenfoSec.empty();
		topGenfoSec.append(`
		<div class="input-group mb-3">
		<input type="text" class="user-name form-control" placeholder="First Name">
		<div class="input-group-append">
			<button class="start-button btn btn-outline-secondary" type="button">Start</button>
		</div>
		</div>`);
	}

	/**
	 * Display the three buttons using jQuery section selection,
	 * button identifies player with data-player. Choice is stored
	 * in data-rps 
	 * @param {jQuery} section 
	 * @param {String} player 
	 */
	function displayButtonsIn(section, player) {
		section.append(`<button class="rps-button btn btn-outline-primary" type="button" data-player="${player}" data-rps="rock">Rock</button>`);
		section.append(`<button class="rps-button btn btn-outline-primary" type="button" data-player="${player}" data-rps="paper">Paper</button>`);
		section.append(`<button class="rps-button btn btn-outline-primary" type="button" data-player="${player}" data-rps="scissors">Scissors</button>`);
	}

	/**
	 * Start the first round of game to propagate rest of the game. 
	 */
	function startGame() {
		displayButtonsIn(p1btnSec, "player1");
		if (myDatabaseRef === "player1") {
			btmGenfoSec.html(`It's your turn!`);
		} else {
			btmGenfoSec.html(`It's ${p1Name}'s turn!`);
		}
	}

	function Initialize() {
		displayAddUser();
		matchInfo.empty();
		chatHist.empty();
		p1nameSec.html(`Waiting for player 1`);
		p2nameSec.html(`Waiting for player 2`);
		p1btnSec.empty();
		p2btnSec.empty();
		p1statSec.empty();
		p2statSec.empty();
	}
	Initialize();

	/**
	 * When page loads, check if p1 and p2 exists in the database.
	 * If either of them do, set corresponding variable value to true.
	 * Then update corresponding displays.
	 */
	database.ref().on("value", function (snap) {
		if (snap.child("players").exists()) {
			if (snap.child("players/player1").val() !== null) {
				p1inDb = true;
				let val1 = snap.child("players/player1").val();
				p1Name = val1.name;
				p1nameSec.html(val1.name);
				p1statSec.html(`wins: ${val1.wins} losses: ${val1.losses}`);
			}
			if (snap.child("players/player2").val() !== null) {
				p2inDb = true;
				let val2 = snap.child("players/player2").val();
				p2Name = val2.name;
				p2nameSec.html(val2.name);
				p2statSec.html(`wins: ${val2.wins} losses: ${val2.losses}`);
			}
		}
		isSpectator = p1inDb && p2inDb;
		// if (isSpectator) {
		// 	topGenfoSec.html(`<h3>Hi! You're spectating</h3>`);
		// }
		if (p1inDb && p2inDb && myDatabaseRef === "player1") {
			startGame();
		}
		console.log(`db p1: ${p1Name} ${p1inDb}, p2: ${p2Name} ${p2inDb}`);
	});

	/**
	 * When the Start button is clicked. Update firebase with the new player.
	 */
	$(document).on("click", ".start-button", function (event) {
		event.preventDefault();
		if (p1inDb && p2inDb) {
			console.log("unexpected access to new player occurred.");
			return;
		}
		let usrName = null;
		$(".user-name").each(function (i, item) {
			usrName = $(item).val().trim();
			$(item).val("");
		});
		if (!p1inDb) {
			console.log(`database p1 is: ${usrName}`);
			database.ref("/players/player1").set({
				choice: "none",
				name: usrName,
				wins: 0,
				losses: 0,
			}, function (errorObject) {
				if (errorObject) {
					console.log("Errors handled: " + errorObject);
				}
			});
			myDatabaseRef = "player1";
		} else {
			console.log(`database p2 is: ${usrName}`);
			database.ref("/players/player2").set({
				choice: "none",
				name: usrName,
				wins: 0,
				losses: 0,
			}, function (errorObject) {
				if (errorObject) {
					console.log("Errors handled: " + errorObject);
				}
			});
			myDatabaseRef = "player2";
		}
		topGenfoSec.html(`<h3>Hi ${usrName}! You are ${myDatabaseRef}</h3>`);
		console.log(`my database reference is: ${myDatabaseRef}`);

	});

	/**
	 * When a RPS selection is made. Update the corresponding player's 
	 * choice param. Then switch player after some cleaning up.
	 */
	$(document).on("click", ".rps-button", function () {
		console.log(`rps button clicked: `);
		console.log($(this));
		let player = $(this).data("player");
		let choice = $(this).data("rps");
		if (player === "player1") {
			p1btnSec.empty();
		} else {
			p2btnSec.empty();
		}
		database.ref(`/players/${player}`).update({
			choice: choice,
		});
	});

	/**
	 * When either player's data changes, update the corresponding data sections.
	 */
	database.ref("/players/player1").on("value", function (snapshot) {
		let val = snapshot.val();
		if (val.choice !== "none") {
			p1btnSec.html(`<h3>${val.choice}</h3>`);
			if (myDatabaseRef === "player1") {
				btmGenfoSec.html(`Waiting for ${p2Name} to choose.`);
			} else {
				btmGenfoSec.html(`It's Your Turn!`);
			}
		} else {
			p1statSec.html(`wins: ${val.wins} losses: ${val.losses}`);
		}
	}, function(error) {
		if (error) {
			console.log(error);
		}
	});
	database.ref("/players/player2").on("value", function (snapshot) {
		let val = snapshot.val();
		if (val.choice !== "none") {
			p2btnSec.html(`<h3>${val.choice}</h3>`);
			if (myDatabaseRef === "player2") {
				btmGenfoSec.html(`Waiting for ${p1Name} to choose.`);
			} else {
				btmGenfoSec.html(`It's Your Turn!`);
			}
		} else {
			p2statSec.html(`wins: ${val.wins} losses: ${val.losses}`);
		}
	}, function(error) {
		if (error) {
			console.log(error);
		}
	});

	/**
	 * Receiving updates from firebase when a new player joins.
	 */
	database.ref("/players/").on("child_added", function (childSnapshot) {

		console.log(`child added:`);
		console.log(childSnapshot);
		console.log(childSnapshot.val());
		

	}, function (errorObject) {
		if (errorObject) {
			console.log("Errors handled: " + errorObject);
		}
	});






	/**
	 * Receiving updates from firebase when a new message is sent.
	 */
	database.ref("/chats/").on("child_added", function (childSnapshot) {

		console.log(childSnapshot);
		console.log(childSnapshot.val());

	}, function (errorObject) {
		if (errorObject) {
			console.log("Errors handled: " + errorObject);
		}
	});

	/**
	 * When a player sends a new message, update firebase.
	 */
	$(".chat-button").on("click", function (event) {
		event.preventDefault();


	});

});