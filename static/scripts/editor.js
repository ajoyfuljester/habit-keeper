import { extractName, getData, redirect } from './utils.js'

async function main() {

	const data = await getData()
	if (!data) {
		return 1
	}

	const elMain = document.querySelector('main')

	const elEditor = document.createElement('div')
	const habitManager = createHabitManager(data.habits)
	elEditor.appendChild(habitManager)
	elMain.appendChild(elEditor)

	const elInitWrapper = createInitWrapper()
	elMain.appendChild(elInitWrapper)

	const elDangerZone = createDangerZone()
	elMain.appendChild(elDangerZone)


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
		elDelete.addEventListener('click', () => handleDeleteHabit(elRename))
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

	const elHabitsLink = createHabitsLink()
	elHabits.appendChild(elHabitsLink)

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
	* @returns {HTMLAnchorElement} element that redirects to the habits
*/
function createHabitsLink() {
	const elLink = document.createElement('a')
	elLink.classList.add('cell')
	elLink.classList.add('habitsLink')
	elLink.innerText = 'Habits'
	elLink.title = 'Go to habits'
	elLink.addEventListener('click', () => redirect(`/u/${extractName()}/habits`))

	return elLink
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
	* @param {HTMLInputElement} elHabitName - element with an `value` property, that will be the name of the new habit
	* @returns {Promise<Response>?} response if deletion failed, else the page is reloaded (refreshed)
*/
async function handleDeleteHabit(elHabitName) {
	const habitName = elHabitName.value

	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "delete",
			type: "habit",
			what: habitName,
		})
	})
	
	const res = await fetch(req)
	
	if (res.status !== 201) {
		return res
	}

	location.reload()
}


/**
	* @returns {HTMLDivElement} element with dangerous elements
*/
function createDangerZone() {
	const elDangerZone = document.createElement('div')
	elDangerZone.classList.add('danger')
	
	const elH1 = document.createElement('h1')
	elH1.innerText = 'DANGER ZONE'
	elDangerZone.appendChild(elH1)

	const elFlex = document.createElement('div')
	elFlex.classList.add('flex')
	elDangerZone.appendChild(elFlex)

	const elInitForce = createInitForceButton()
	elFlex.appendChild(elInitForce)

	return elDangerZone
}


/**
	* @returns {HTMLDivElement} element with a heading and a button to init the datafile
*/
function createInitWrapper() {
	const el = document.createElement('div')
	el.classList.add('flex-column')

	const elH1 = document.createElement('h1')
	elH1.innerText = "If you don't see anything useful here, you might want to click this button"
	el.appendChild(elH1)

	const elInitButton = createInitButton()
	el.appendChild(elInitButton)

	return el
}


/**
	@returns {HTMLInputElement} button element with stuff to initialize a datafile
*/
function createInitButton() {
	const el = document.createElement('input')
	el.type = 'button'
	el.value = 'Initialize or something'
	el.addEventListener('click', () => handleInit())

	return el
}


/**
	@returns {HTMLInputElement} button element with stuff to forcefully initialize a datafile - DESTROY DATA
*/
function createInitForceButton() {
	const el = document.createElement('input')
	el.type = 'button'
	el.value = 'DESTROY YOUR DATA'
	el.addEventListener('click', () => handleInit(true))

	return el
}


/**
	* @param {Boolean} [force=false] whether to force init - overwrite data
	* @returns {Boolean} whether `init` request was successful
*/
async function handleInit(force = false) {
	const name = extractName()
	const res = await fetch(`/api/data/${name}/init${force ? '/force' : ''}`)
	console.log("init", res.ok)
	return res.ok
}

const exitCode = await main()

console.log("exitCode:", exitCode)
