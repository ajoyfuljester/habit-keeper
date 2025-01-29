import { extractName, getData, highlight } from './utils.js'

async function main() {
	const data = await getData()
	if (!data) {
		return 1
	}

	const editor = document.querySelector('#editor')
	const boardManager = createBoardManager(data.boards)
	editor.appendChild(boardManager)

	for (const board of data.boards) {
		const boardEditor = createBoardEditor(board)
		editor.appendChild(boardEditor)
	}
}


/**
	* @param {import("./habits.js").boardObject[]} boardsObject - object with information about a board
	* @returns {HTMLDivElement} element with board manager stuff
	* @todo i think the param type is wrong
*/
function createBoardManager(boardsObject) {
	console.log(boardsObject)
	const elManager = document.createElement('div')
	elManager.classList.add('board-manager')
	
	const elHeader = document.createElement('h1')
	elHeader.innerText = 'Board manager'
	elManager.appendChild(elHeader)

	const elBoards = document.createElement('div')
	elBoards.classList.add('grid-boards')

	for (let i in boardsObject) {
		const board = boardsObject[i]
		const elRename = document.createElement('input')
		elRename.value = board.name
		elRename.placeholder = board.name
		elRename.classList.add('cell')
		elRename.dataset.row = i
		elBoards.appendChild(elRename)

		const elRenameConfirm = document.createElement('input')
		elRenameConfirm.type = "button"
		elRenameConfirm.classList.add('cell')
		elRenameConfirm.value = "Rename"
		elRenameConfirm.title = "Change the name of the board"
		elRenameConfirm.dataset.row = i
		elRenameConfirm.addEventListener('click', () => handleRenameBoard(elRename))
		elBoards.appendChild(elRenameConfirm)

		const elDelete = document.createElement('input')
		elDelete.type = "button"
		elDelete.classList.add('cell')
		elDelete.value = "Delete"
		elDelete.title = "Remove the board"
		elBoards.appendChild(elDelete)
	}

	const elCreate = document.createElement('input')
	elCreate.classList.add('cell')
	elCreate.placeholder = "Board name"
	elBoards.appendChild(elCreate)

	const elCreateConfirm = document.createElement('input')
	elCreateConfirm.classList.add('cell')
	elCreateConfirm.type = "button"
	elCreateConfirm.value = "Create"
	elCreateConfirm.title = "Add a new board"
	elCreateConfirm.addEventListener('click', () => handleCreateBoard(elCreate))
	elBoards.appendChild(elCreateConfirm)

	elManager.appendChild(elBoards)

	return elManager
}

// TODO HEREEEEEE!!!!!!!! 9
/**
	* @param {import("./habits.js").boardObject} boardObject - object with information about a board
*/
function createBoardEditor(boardObject) {
	const elEditor = document.createElement('div')
	elEditor.classList.add('board-editor')
	
	const elHeader = document.createElement('h1')
	elHeader.innerHTML = highlight`Habit manager for board ${boardObject.name}`
	elEditor.appendChild(elHeader)

	const elBoards = document.createElement('div')
	elBoards.classList.add('grid-habits')

	for (let i in boardObject.habits) {
		const habit = boardObject[i]
		const elRename = document.createElement('input')
		elRename.value = habit.name
		elRename.placeholder = habit.name
		elRename.classList.add('cell')
		elRename.dataset.row = i
		elBoards.appendChild(elRename)

		const elRenameConfirm = document.createElement('input')
		elRenameConfirm.type = "button"
		elRenameConfirm.classList.add('cell')
		elRenameConfirm.value = "Rename"
		elRenameConfirm.title = "Change the name of the habit"
		elRenameConfirm.dataset.row = i
		elRenameConfirm.addEventListener('click', () => handleRenameHabit(elRename))
		elBoards.appendChild(elRenameConfirm)

		const elDelete = document.createElement('input')
		elDelete.type = "button"
		elDelete.classList.add('cell')
		elDelete.value = "Delete"
		elDelete.title = "Remove the habit"
		elBoards.appendChild(elDelete)
	}

	const elCreate = document.createElement('input')
	elCreate.classList.add('cell')
	elCreate.placeholder = "Habit name"
	elBoards.appendChild(elCreate)

	const elCreateConfirm = document.createElement('input')
	elCreateConfirm.classList.add('cell')
	elCreateConfirm.type = "button"
	elCreateConfirm.value = "Create"
	elCreateConfirm.title = "Add a new habit to this board"
	elCreateConfirm.addEventListener('click', () => handleCreateHabit(elCreate))
	elBoards.appendChild(elCreateConfirm)

	elEditor.appendChild(elBoards)

	return elEditor
}



/**
	* @param {HTMLInputElement} elBoardName element with a `placeholder` (current name) and `value` property, that will be the new name of the board
	* @returns {Promise<Number>} exitCode
	*
	* @todo something is wrong here with the returning
*/
async function handleRenameBoard(elBoardName) {
	const currentName = elBoardName.placeholder
	const newName = elBoardName.value

	const name = extractName();
	if (!name) {
		console.error(location.pathname)
		return 4
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



/**
	* @param {HTMLInputElement} elBoardName - element with an `value` property, that will be the name of the new board
	* @returns {Promise<Response>?} response if creation failed, else the page is reloaded (refreshed)
*/
async function handleCreateBoard(elBoardName) {
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


/**
	* @param {HTMLInputElement} elHabitName - element with an `value` property, that will be the name of the new board
	* @returns {Promise<Response>?} response if creation failed, else the page is reloaded (refreshed)
*/
async function handleCreateHabit(elHabitName) {
	const habitName = elHabitName.value

	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "create",
			type: "habit",
			where: ,
			what: {name: habitName},
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

const exitCode = await main()

console.log("exitCode:", exitCode)
