import { extractName, getData } from './utils.js'

async function main() {
	document.querySelector('#init').addEventListener('click', handleInit)


	const data = await getData()
	if (!data) {
		return 1
	}


	const editor = document.querySelector('#editor')
	const habitManager = createHabitManager(data.habits)
	editor.appendChild(habitManager)





	return 0
}



// TODO HEREEEEEE!!!!!!!! 9
/**
	* @param {import("./habits.js").habitObject[]} habitsObject - array of objects with information about the habits
*/
function createHabitManager(habitsObject) {
	const elEditor = document.createElement('div')
	elEditor.classList.add('habit-manager')
	
	const elHeader = document.createElement('h1')
	elHeader.innerHTML = 'Habit manager'
	elEditor.appendChild(elHeader)

	const elHabits = document.createElement('div')
	elHabits.classList.add('grid-habits')

	for (let i in habitsObject) {
		const habit = habitsObject[i]
		const elRename = document.createElement('input')
		elRename.value = habit.name
		elRename.placeholder = habit.name
		elRename.classList.add('cell')
		elRename.dataset.row = i
		elHabits.appendChild(elRename)

		const elRenameConfirm = document.createElement('input')
		elRenameConfirm.type = "button"
		elRenameConfirm.classList.add('cell')
		elRenameConfirm.value = "Rename"
		elRenameConfirm.title = "Change the name of the habit"
		elRenameConfirm.dataset.row = i
		elRenameConfirm.addEventListener('click', () => handleRenameHabit(elRename))
		elHabits.appendChild(elRenameConfirm)

		const elDelete = document.createElement('input')
		elDelete.type = "button"
		elDelete.classList.add('cell')
		elDelete.value = "Delete"
		elDelete.title = "Remove the habit"
		elHabits.appendChild(elDelete)
	}

	const elCreate = document.createElement('input')
	elCreate.classList.add('cell')
	elCreate.placeholder = "Habit name"
	elCreate.title = "Name of the habit to be created"
	elHabits.appendChild(elCreate)

	const elCreateConfirm = document.createElement('input')
	elCreateConfirm.classList.add('cell')
	elCreateConfirm.type = "button"
	elCreateConfirm.value = "Create"
	elCreateConfirm.title = "Add a new habit"
	elCreateConfirm.addEventListener('click', () => handleCreateHabit(elCreate))
	elHabits.appendChild(elCreateConfirm)

	elEditor.appendChild(elHabits)

	return elEditor
}


/**
	* @param {HTMLInputElement} elHabitName - element with an `value` property, that will be the name of the new habit
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

/**
	* @param {HTMLInputElement} elHabitName - element with an `value` property, that will be the name of this habit
	* @returns {Promise<Response>?} response if renaming failed, else the page is reloaded (refreshed)
*/
async function handleRenameHabit(elHabitName) {
	const oldHabitName = elHabitName.placeholder
	const newHabitName = elHabitName.value

	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "rename",
			type: "habit",
			what: oldHabitName,
			toWhat: newHabitName,
		})
	})
	
	const res = await fetch(req)
	
	if (res.status !== 201) {
		return res
	}

	location.reload()
}

/**
	* @returns {Boolean} whether `init` request was successful
*/
async function handleInit() {
	const name = extractName()
	const res = await fetch(`/api/data/${name}/init`)
	console.log("init", res.ok)
	return res.ok
}

const exitCode = await main()

console.log("exitCode:", exitCode)
