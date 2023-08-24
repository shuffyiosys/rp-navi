function createRandomId() {
	const idLetters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
	let id = "";

	for (let i = 0; i < 24; i++) {
		id += idLetters[Math.floor(Math.random() * 16)];
	}
	return id;
}

function pad(num, size) {
	var s = "000000000" + num;
	return s.substring(s.length - size);
}

function shuffle(array) {
	let currentIndex = array.length;
	let temporaryValue;
	let randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function getRandomCeil(maxValue, minValue = 0) {
	return Math.ceil(Math.random() * maxValue + minValue);
}

function getRandomFloor(maxValue, minValue = 0) {
	return Math.floor(Math.random() * maxValue + minValue);
}

module.exports = {
	createRandomId,
	pad,
	shuffle,
	getRandomCeil,
	getRandomFloor,
};
