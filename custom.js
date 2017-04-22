var count = 9;
var minesAll = 10;
var permit = false;
var beginTime, endTime, timer;

$(document).ready(function() {
	var container = $(".field");
	var row = $("<div class='line'></div>");
	var item = $("<div class='item'></div>");
	var currentRow;
	var currentItem;

	for (var i = 0; i < count; i++) {
		currentRow = row.clone();
		container.append(currentRow);
		for (var j = 0; j < count; j++) {
			currentItem = item.clone();
			currentRow.append(currentItem);
		}
	}

	$(".new-game button").on("click", function() {
		currentGame = new Game();
		currentGame.createMines();
		currentGame.createSums();
		currentGame.startTimer();
		ourPlayer = new Player();
		permit = true;
	});

	$(".item").on("mousedown", function(event) {
		var parI, parJ, parentLine, items;
		if (permit) {
			parentLine = $(this).parents(".line");
			parI = $(".line").index(parentLine);
			items = parentLine.find(".item");
			parJ = items.index(this);
			if (event.which == 1) {
				if (currentGame.cells[parI][parJ] == -1)
					currentGame.explosionEnd();
				else {
					$(this).addClass("open");
					$(this).text(currentGame.cells[parI][parJ]);
					currentGame.checkEnd();
				}
			} else if (event.which == 3) {
				if ($(this).hasClass("red")) {
					$(this).removeClass("red").html("");
					ourPlayer.removeMine();
				} else {
					$(this).html("&#9967;").addClass("red");
				    ourPlayer.addMine();
					currentGame.checkEnd();
				}
			}
		}
	});

	$('.item').bind('contextmenu', function(event){
    	event.preventDefault();
    	return false;
	});

	$(".alert button.close").on("click", function() {
		currentGame.clearGame();
		delete currentGame;
		$(".alert").hide();
	});
});

function Game() {
	this.cells = [],
	this.createMines = function() {
		var indI, indJ, cond;
		var indArr = [];
		var elem = [];
		for (var i = 0; i < count; i++) {
			this.cells[i] = [];
		}
		for (var i = 0; i < minesAll; i++) {
			do {
				indI = Math.floor(Math.random()*count);
				indJ = Math.floor(Math.random()*count);
				elem = [indI, indJ];
				cond = false;
				for (var j = 0; j < indArr.length; j++) {
					if (indArr[j][0] == elem[0] 
						&& indArr[j][1] == elem[1]) {
						cond = true;
						break;
					}
				}
			} while (cond);
			indArr.push(elem);
			this.cells[indI][indJ] = -1;
		}
	},
	this.createSums = function() {
		var counter, i1, i2, j1, j2;
		for (var i = 0; i < count; i++) {
			i1 = i - 1;
			i2 = i + 1;
			for (var j = 0; j < count; j++) {
				if (this.cells[i][j] == -1) continue;
				j1 = j - 1;
				j2 = j + 1;
				counter = 0;
				counter = this.addCounter(i1, j1, counter);
				counter = this.addCounter(i1, j, counter);
				counter = this.addCounter(i1, j2, counter);
				counter = this.addCounter(i, j1, counter);
				counter = this.addCounter(i, j2, counter);
				counter = this.addCounter(i2, j1, counter);
				counter = this.addCounter(i2, j, counter);
				counter = this.addCounter(i2, j2, counter);
				this.cells[i][j] = counter;
			}
		}
	},
	this.addCounter = function(parI, parJ, result) {
		if (yes(parI) && yes(parJ) && this.cells[parI][parJ] == -1) 
			return ++result;
		else
			return result;
	},
	this.startTimer = function() {
		beginTime = new Date();
		timer = setInterval(timerFunction, 1000);
	},
	this.stopTimer = function() {
		clearInterval(timer);
	},
	this.checkEnd = function() {
		if (ourPlayer.mines == minesAll 
			&& $(".item.open").length == count*count-minesAll)
			this.victoryEnd();
	},
	this.explosionEnd = function() {
		this.stopTimer();
		this.showMines();
		permit = false;
		$(".alert-danger").show();
	},
	this.victoryEnd = function() {
		this.stopTimer();
		this.showSumsMines();
		permit = false;
		$(".alert-success").show();
		var tempText = $("#timer").text();
		$("#endTimer").text(tempText);
	},
	this.showMines = function() {
		$(".item").html("").removeClass("red").addClass("open");
		for (var i = 0; i < count; i++) {
			for (var j = 0; j < count; j++) {
				if (this.cells[i][j] == -1)
					$(".line").eq(i).find(".item").eq(j)
					.html("&#9967;").addClass("bold");
			}
		}
	},
	this.showSumsMines = function() {
		for (var i = 0; i < count; i++) {
			for (var j = 0; j < count; j++) {
				if (this.cells[i][j] == -1)
					$(".line").eq(i).find(".item")
					.eq(j).removeClass("red")
					.addClass("grey").addClass("open");
			}
		}
	},
	this.clearGame = function() {
		$(".item").html("").removeClass("open")
		.removeClass("red").removeClass("bold").removeClass("grey");
		$("#timer").text("00:00");
	}
}

function Player() {
	this.mines = 0,
	this.addMine = function() {
		this.mines++;
	},
	this.removeMine = function() {
		this.mines--;
	}
}

function yes(x) {
	return x >= 0 && x < count;
}

function timerFunction() {
	var currentTime = new Date();
	currentTime -= beginTime;
	var secs = currentTime/1000;
	var minutes = Math.floor(secs/60);
	if (minutes <= 9) minutes = "0" + minutes;
	secs -= minutes * 60;
	secs = Math.round(secs);
	if (secs <= 9) secs = "0" + secs;
	$("#timer").text(minutes + ":" + secs);
}