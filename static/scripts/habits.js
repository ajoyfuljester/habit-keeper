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

function createBoard(boardInfo) { // TODO: this
	const board = document.createElement('div');
	board.classList.add('board')
	for (const habitInfo of boardInfo) {



		board.appendChild(habit)
	}
}

function createHabit(habitInfo) { // TODO: HERE!!!
	const elHabit = document.createElement('div');
	elHabit.classList.add('habit')

	const elName = document.createElement('div');
	elName.innerText(habitInfo.name)

	elHabit.appendChild(elName)

	const offsets = habitInfo.offsets
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
