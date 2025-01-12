import { extractName, getData } from './utils.js'

function loadHabits(data) {
	for (const board of data.boards) {
		createBoard()
	}
}

function main() {
	const data = getData()
	if (!data) {
		return 1
	}

	if (!data.boards || data.boards.length == 0) {
		const el = handleNoBoards()
		document.querySelector('#boards').appendChild(el)
		return 2
	}
}



/**
	* @typedef {Object} boardObj object with information about a board
	* @property {String} boardObj.name name of the board
	*
	* @param {boardObj} boardObj 
*/
function createBoard(boardObj) { // TODO: this
	const board = document.createElement('div');
	board.classList.add('board')
	for (const habitInfo of boardObj) {



		board.appendChild(habit)
	}
}


/**
	* @typedef {Object} habitObj object with information about a habit
	* @property {String} habitObj.name name of the habit
	* @property {String} habitObj.startingDate starting date of the habit (ISO format: YYYY-MM-DD)
	* @property {[Number, Number][]} habitObj.offsets array of two elemt arrays `[offset, value]`
	*
	* @param {habitObj} habitObj object with information about a habit
*/
function createHabit(habitObj) { // TODO: HERE!!!
	const elHabit = document.createElement('div');
	elHabit.classList.add('habit')

	const elName = document.createElement('div');
	elName.innerText(habitObj.name)

	elHabit.appendChild(elName)

	const offsets = habitObj.offsets
	offsets.sort()

	for (let i = 0; i < offsets.at(-1); i++) { // TODO: handle more than one success in a day
		const elOffset = document.createElement('div');
		elHabit.appendChild(elOffset)
		if (!offsets.includes(i)) {
			continue;
		}
		elOffset.classList.add('offset')
	}


}

function statistics(habitInfo) { // TODO: HERE 2
	const stats = {}
	stats.successes = habitInfo.offsets?.length


	return stats;

}

function createStatistics(habitInfo) {
	const elStats = document.createElement('div')
	elStats.classList.add('stats')

}

function createStat(key, value) {
	const elKey = document.createElement('div');
	elKey.innerText = key
	const elValue = document.createElement('div');
	elValue.innerText = value

	return [elKey, elValue]

}


/**
	* @returns {HTMLDivElement} html element with content to be displayed when no boards are found
*/
function handleNoBoards() {
	const name = extractName()
	const el = document.createElement('div');
	const elSpan = document.createElement('span')
	elSpan.innerText = `Seems there are no boards here `
	el.appendChild(elSpan)
	const elButton = document.createElement('a')
	elButton.href = `/u/${name}/editor`
	elButton.innerText = 'Click here to create one'
	el.appendChild(elButton)

	return el
}

const exitCode = main()

console.log("exitCode:", exitCode)
