import { redirect } from './utils.js'

async function fetchdata() {
	const path = location.pathname

	if (!/\/profile\/\w+/.test(path)) {
		return false
	}
	
	const name = path.split('/')[2]

	const req = new Request(`/api/data/${name}/get`)
	const res = await fetch(req);
	const status = res.status
	if (status == 401) {
		redirect('/static/sites/login.html')
		return false
	}
	const result = await res.json();
	console.log(result)
}

function loadHabits(data) {

}

function main() {
	const data = fetchdata()
	if (!data) {
		return 1
	}
	
	for (const board of data.boards) {
		createBoard()
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

	for (let i = 0; i < offsets.at(-1); i++) {
		const elOffset = document.createElement('div');
		elHabit.appendChild(elOffset)
		if (!offsets.includes(i)) {
			continue;
		}
		elOffset.classList.add('offset')
	}

	const stats = {}

}

function statisticks(habitInfo) { // TODO: HERE 2
	const stats = {}
}

const exitCode = main()

console.log(exitCode)
