import { extractName, getData, dateToOffset, addDays } from './utils.js'

function loadHabits(data) {
	const elData = document.querySelector("#data")
	for (const board of data.boards) {
		const today = new Date()
		const elBoard = createBoard(board, {days: [addDays(today, -1), today, addDays(today, 1)]})

		elData.appendChild(elBoard)
	}

	return elData
}

async function main() {
	const data = await getData()
	if (!data) {
		return 1
	}

	console.log(data)

	if (!data.boards || data.boards.length == 0) {
		const el = handleNoBoards()
		document.querySelector('#boards').appendChild(el)
		return 2
	}


	loadHabits(data)

	return 0
}



/**
	* @typedef {Object} boardObject object with information about a board
	* @property {String} boardObject.name name of the board
	* @property {habitObject[]} boardObject.habits array of habit objects
	*
	* @typedef {Object} boardOptionsObject object additional options
	* @property {Date[]} [boardOptionsObject.days=[]] array of the days to be displayed
	*
	* @param {boardObject} boardObject 
*/
function createBoard(boardObject, {days = []}) { // TODO: this
	console.log({boardObject})
	const elBoard = document.createElement('div');
	elBoard.classList.add('board')
	
	const elHeader = document.createElement('header')

	const elH3 = document.createElement('h3')
	elH3.innerText = boardObject.name
	elHeader.appendChild(elH3)

	elBoard.appendChild(elHeader)

	for (const habitInfo of boardObject.habits) {
		const elHabit = createHabit(habitInfo, {days: days.map(d => dateToOffset(habitInfo.startingDate, d))})


		elBoard.appendChild(elHabit)
	}


	return elBoard
}


/**
	* @typedef {[Number, Number]} offsetObject two element array `[offset, value]`
	*
	* @typedef {Object} habitObject object with information about a habit
	* @property {String} habitObject.name name of the habit
	* @property {String} habitObject.startingDate starting date of the habit (ISO format: YYYY-MM-DD)
	* @property {offsetObject[]} habitObject.offsets array of two element arrays `[offset, value]`
	*
	* @typedef {Object} habitOptionsObject object additional options
	* @property {Number[]} [habitOptionsObject.days=[]] array of the days to be displayed represented as offset - relative to `habitObject.startingDate`
	*
	* @param {habitObject} habitObject object with information about a habit
	* @param {habitOptionsObject} habitOptionsObject object with additional options
	* @returns {HTMLDivElement} habit element
*/
function createHabit(habitObject, {days = []}) { // TODO: HERE!!!
	const elHabit = document.createElement('div');
	elHabit.classList.add('habit')

	const elName = document.createElement('div');
	elName.innerText(habitObject.name)

	elHabit.appendChild(elName)

	const offsets = habitObject.offsets
	offsets.sort()

	for (let day of days) {
		const elOffset = document.createElement('div');
		elHabit.appendChild(elOffset)
		if (!hasOffset(habitObject.offsets, day)) {
			continue;
		}
		elOffset.classList.add('offset')
	}

	return elHabit


}

function statistics(habitInfo) {
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

/**
	* @param {offsetObject[]} array array containing offsets (haystack)
	* @param {Number} day day number (needle) I HATE NAMING THINGS
	* @returns {Boolean} wherther the `array` has the `day`
*/
function hasOffset(array, day) {
	return !!array.find(o => o[0] === day)
}

const exitCode = await main()

console.log("exitCode:", exitCode)
