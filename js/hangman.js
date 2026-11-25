let words = [];
let selectedWord = "";
let selectedHint = "";
let guessedLetters = [];
let incorrectGuesses = 0;
let gameOver = false;

const maxIncorrectGuesses = 6;

const hangmanGame = {
	startGame: function() {
		if (words.length === 0) {
			$("#word-hint").text("Unable to load words.");
			return;
		}

		let randomIndex = Math.floor(Math.random() * words.length);

		selectedWord = words[randomIndex].word.toUpperCase();
		selectedHint = words[randomIndex].hint;
		guessedLetters = [];
		incorrectGuesses = 0;
		gameOver = false;

		$("#word-hint").text(selectedHint);
		$("#coffee-image").attr("src", "images/coffee-0.png");
		$("#coffee-image").attr("alt", "A full cup of coffee");
		$("#guesses-remaining").text("Incorrect Guesses: 0 / 6");

		$("#game-modal").hide().attr("aria-hidden", "true");
		$("#modal-title").text("");
		$("#modal-message").text("");
		$("#modal-word").text("");

		createLetterButtons();
		updateWordDisplay();
	},

	guessLetter: function(letter) {
		if (gameOver) {
			return;
		}

		letter = letter.toUpperCase();

		if (!/^[A-Z]$/.test(letter)) {
			return;
		}

		if (guessedLetters.includes(letter)) {
			return;
		}

		guessedLetters.push(letter);

		$(".letter-button[value='" + letter + "']").prop("disabled", true);

		if (selectedWord.includes(letter)) {
			updateWordDisplay();
			checkWin();
		} else {
			incorrectGuesses++;

			$("#coffee-image").attr("src", "images/coffee-" + incorrectGuesses + ".png");

			$("#coffee-image").attr("alt", "Coffee cup after " + incorrectGuesses + " incorrect guesses");

			$("#guesses-remaining").text("Incorrect Guesses: " + incorrectGuesses + " / " + maxIncorrectGuesses);

			$("#coffee-image").stop(true, true).hide().fadeIn(400);

			if (incorrectGuesses >= maxIncorrectGuesses) {
				endGame(false);
			}
		}
	}
};

function loadWords() {
	fetch("js/words.json")
		.then(function(response) {
			if (!response.ok) {
				throw new Error("Unable to load the word list.");
			}

			return response.json();
		})
		.then(function(data) {
			words = data;
			hangmanGame.startGame();
		})
		.catch(function(error) {
			$("#word-hint").text("Unable to load words. Please try again.");

			console.error(error);
		});
}

function createLetterButtons() {
	$("#letter-buttons").empty();

	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	for (let i = 0; i < alphabet.length; i++) {
		let letter = alphabet[i];

		let button = $("<button></button>")
			.addClass("control-button letter-button")
			.attr("type", "button")
			.val(letter)
			.text(letter);

		$("#letter-buttons").append(button);
	}
}

function updateWordDisplay() {
	$("#word-display").empty();

	for (let i = 0; i < selectedWord.length; i++) {
		let letter = selectedWord[i];

		let letterBox = $("<span></span>").addClass("word-letter");

		if (letter === " ") {
			letterBox.addClass("word-space");
		} else if (guessedLetters.includes(letter)) {
			letterBox.text(letter);
		} else {
			letterBox.text("_");
		}

		$("#word-display").append(letterBox);
	}
}

function checkWin() {
	let allLettersGuessed = true;

	for (let i = 0; i < selectedWord.length; i++) {
		let letter = selectedWord[i];

		if (letter !== " " && !guessedLetters.includes(letter)) {
			allLettersGuessed = false;
		}
	}

	if (allLettersGuessed) {
		endGame(true);
	}
}

function endGame(won) {
	gameOver = true;

	$(".letter-button").prop("disabled", true);

	if (won) {
		$("#modal-title").text("You Won!");
		$("#modal-message").text("Congratulations! You've earned ONE FREE COFFEE!");
		$("#modal-image").attr("src", "images/coffee-0.png");
		$("#modal-image").attr("alt", "A full cup of coffee");
		$(".modal-content").removeClass("lose").addClass("win");
	} else {
		$("#modal-title").text("Out of Coffee!");
		$("#modal-message").text("Your coffee cup is empty. Better luck next time!");
		$("#modal-image").attr("src", "images/coffee-6.png");
		$("#modal-image").attr("alt", "An empty cup of coffee");
		$(".modal-content").removeClass("win").addClass("lose");
	}

	$("#modal-word").text("The word was: " + selectedWord);

	$("#game-modal")
		.attr("aria-hidden", "false")
		.fadeIn(400);

	$("#play-again").trigger("focus");
}

$("#letter-buttons").on("click", ".letter-button", function() {
	let letter = $(this).val();

	hangmanGame.guessLetter(letter);
});

$("#play-again").on("click", function() {
	hangmanGame.startGame();
});

loadWords();
