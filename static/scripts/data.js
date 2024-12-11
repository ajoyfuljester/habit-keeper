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
}

const exitCode = main()

console.log(exitCode)
