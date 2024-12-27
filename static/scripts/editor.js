import { extractName, getData } from './utils.js'

function main() {
	const data = getData()
	if (!data) {
		return 1
	}

	// TODO: HERE 3
	const boardManager = createBoardManager()
	const editor = document.querySelector('#editor')
	editor.appendChild(boardManager)
}

function createBoardManager(boardsInfo) {
	const elManager = document.createElement('div')
	elManager.classList.add('board-manager')
	
	const elHeader = document.createElement('h1')
	elHeader.innerText = 'Board manager'
	elManager.appendChild(elHeader)

	const elBoards = document.createElement('div')
	elBoards.classList.add('grid-boards')

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
		elRenameConfirm.addEventListener('click', handleRename)
		elBoard.appendChild(elRenameConfirm)

		const elDelete = document.createElement('button')
		elDelete.classList.add('cell')
		elDelete.innerText = "Delete"
		elDelete.title = "Remove the board"
		elBoard.appendChild(elDelete)

		elBoards.appendChild(elBoard)
	}

	elManager.appendChild(elBoards)

	// TODO: row - create board
	const elCreateRow = document.createElement('div')
	const elCreate = document.createElement('input')
	elCreate.placeholder = "Board name"
	elCreateRow.appendChild(elCreate)

	const elCreateConfirm = document.createElement('button')
	elCreateConfirm.innerText = "Create"
	elCreateConfirm.title = "Add a new board"
	elCreateConfirm.addEventListener('click', () => handleCreate(elCreate))
	elCreateRow.appendChild(elCreateConfirm)

	elManager.appendChild(elCreateRow)

	return elManager
}

async function renameBoard(currentName, newName) {
	const name = extractName();
	if (!name) {
		console.error(location.pathname)
	}

	const req = new Request(`/api/data/${name}/action`, {
		method: 'POST',
		body: JSON.stringify({
			action: "rename",
			type: "board",
			what: currentName,
			toWhat: newName,
		})})
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

async function handleRename(event) {
	// TODO: HERE 4, handle click event, get rowID and rename
	console.log(event.target)
}

async function handleCreate(elBoardName) {
	const boardName = elBoardName.value

	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "create",
			type: "board",
			what: {name: boardName},
		})
	})
	// TODO: logging here too
	
	const res = await fetch(req)
	
	if (res.status !== 201) {
		// TODO: logging here too
		return res
	}

	location.reload()
}

const exitCode = main()

console.log("exitCode:", exitCode)
