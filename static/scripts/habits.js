import { extractName, getData } from './utils.js'

function loadHabits(data) {
	const elData = document.querySelector("#data")
	for (const board of data.boards) {
		const elBoard = createBoard(board)

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
	* @param {boardObject} boardObject 
*/
function createBoard(boardObject) { // TODO: this
	const elBoard = document.createElement('div');
	elBoard.classList.add('board')
	
	const elHeader = document.createElement('header')

	const elH3 = document.createElement('h3')
	elH3.innerText = boardObject.name
	elHeader.appendChild(elH3)

	elBoard.appendChild(elHeader)

	for (const habitInfo of boardObject.habits) {
		const elHabit = createHabit(habitInfo)


		elBoard.appendChild(elHabit)
	}


	return elBoard
}


/**
	* @typedef {Object} habitObject object with information about a habit
	* @property {String} habitObject.name name of the habit
	* @property {String} habitObject.startingDate starting date of the habit (ISO format: YYYY-MM-DD)
	* @property {[Number, Number][]} habitObject.offsets array of two elemt arrays `[offset, value]`
	*
	* @param {habitObject} habitObject object with information about a habit
	* @returns {HTMLDivElement} habit element
*/
function createHabit(habitObject) { // TODO: HERE!!!
	const elHabit = document.createElement('div');
	elHabit.classList.add('habit')

	const elName = document.createElement('div');
	elName.innerText(habitObject.name)

	elHabit.appendChild(elName)

	const offsets = habitObject.offsets
	offsets.sort()

	for (let i = 0; i < offsets.at(-1); i++) { // TODO: handle more than one success in a day
		const elOffset = document.createElement('div');
		elHabit.appendChild(elOffset)
		if (!offsets.includes(i)) {
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

const exitCode = await main()

console.log("exitCode:", exitCode)
