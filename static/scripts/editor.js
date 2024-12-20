import { extractName } from './utils.js'
import { getData } from './data.js'

function main() {
	const data = getData()
	if (!data) {
		return 1
	}

	// TODO: HERE 3
}

function loadBoardManager(boardsInfo) {
	const elManager = document.createElement('div')
	elManager.classList.add('board-manager')
	for (let i in boardsInfo) {
		const board = boardsInfo[i]
		const elBoard = document.createElement('div')
		const elRename = document.createElement('input')
		elRename.value = board.name
		elRename.placeholder = board.name
		elRename.classList.add('cell')
		elRename.dataset.rowID = i
		elBoard.appendChild(elRename)

		const elRenameConfirm = document.createElement('button')
		elRenameConfirm.classList.add('cell')
		elRenameConfirm.innerText = "Rename"
		elRenameConfirm.title = "Change the name of the board"
		elRenameConfirm.dataset.rowID = i
		elBoard.appendChild(elRenameConfirm)

		const elDelete = document.createElement('button')
		elDelete.classList.add('cell')
		elDelete.innerText = "Delete"
		elDelete.title = "Remove the board"
		elBoard.appendChild(elDelete)

		elManager.appendChild(elBoard)
	}
}

async function renameBoard(currentName, newName) {
	const name = extractName();
	if (!name) {
		console.error(location.pathname)
	}

	const req = new Request('/api/me/boards/rename', {method: 'POST', body: JSON.stringify({currentName, newName})}) // TODO: think about the route
	const res = await fetch(req)

	if (res.status == 400) {
		// TODO: logging
		console.warn(res)
		return 1
	}

	if (res.status == 404) {
		console.warn(res)
		return 2
	}

	if (res.status !== 200) {
		console.error(res)
		return 3
	}

	return 0
}

async function handleBoardRenaming() {
	// TODO: HERE 4, handle click event, get rowID and rename
}

const exitCode = main()

console.log(exitCode)
