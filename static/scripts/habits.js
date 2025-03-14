import { extractName, getData, dateToOffset, addDays, randomInteger, redirect } from './utils.js'
import * as Colors from "./colors.js"
import { createStats } from "./stats.js"

/**
	* @param {import('./utils.js').dataObject} data - data-like object I DON'T KNOW HOW TO WRITE DOCUMENTATION!!!!!!!!!!!!
*/
function loadHabits(data) {
	/** @type {HTMLDivElement} */
	const elData = document.querySelector("#data")
	elData.classList.add('grid-habits')

	elData.style.setProperty('--number-of-habits', data.habits.length)

	const today = new Date();
	const days = [addDays(today, -6), addDays(today, -5), addDays(today, -4), addDays(today, -3), addDays(today, -2), addDays(today, -1), today]

	elData.style.setProperty('--number-of-days', days.length)

	const statsIDs = [0]

	elData.style.setProperty('--number-of-stats', statsIDs.length)

	elData.appendChild(_createPlaceholder())
	for (const day of days) {
		const elDay = createDate(day)
		elData.appendChild(elDay)
	}
	elData.appendChild(_createPlaceholder())

	for (const habit of data.habits) {
		createHabit(elData, habit, {days})
		createStats(elData, habit.offsets, [0])
	}

	const elEditorLink = createEditorLink()
	elData.appendChild(elEditorLink)

	createSumRow(elData)

	elData.appendChild(_createPlaceholder())

	updateView(elData)

	return elData
}

async function main() {
	const data = await getData()
	if (!data) {
		return 1
	}

	console.log(data)

	loadHabits(data)

	return 0
}



/**
	* @typedef {[Number, Number]} offsetArray two element array `[offset, value]`
	*
	* @typedef {Object} habitObject object with information about a habit
	* @property {String} habitObject.name name of the habit
	* @property {String} habitObject.startingDate starting date of the habit (ISO format: YYYY-MM-DD)
	* @property {offsetArray[]} habitObject.offsets array of two element arrays `[offset, value]`
	*
	* @typedef {Object} habitOptionsObject object additional options
	* @property {Number[]} [habitOptionsObject.days=[]] array of the days to be displayed represented as offset - relative to `habitObject.startingDate`
	*
	* @param {HTMLDivElement} elParent parent element - grid
	* @param {habitObject} habitObject object with information about a habit
	* @param {habitOptionsObject} habitOptionsObject object with additional options
	* @returns {0} exit code, always `0`?
*/
function createHabit(elParent, habitObject, {days = []}) {
	const elName = document.createElement('h3');
	elName.innerText = habitObject.name
	elParent.appendChild(elName)


	const offsets = habitObject.offsets
	offsets.sort()

	const relativeDays = days.map(d => dateToOffset(habitObject.startingDate, d))
	const hue = randomInteger(0, 360)
	for (const day of relativeDays) {
		const elOffset = document.createElement('div');
		elOffset.classList.add('day')
		elOffset.style.setProperty('--hue', hue)

		// TODO: write a function to maybe set value, but that's less important i think
		elOffset.addEventListener('click', () => handleToggleOffset(habitObject.name, day, elOffset, elParent))
		elParent.appendChild(elOffset)
		if (!hasOffset(habitObject.offsets, day)) {
			continue;
		}
		elOffset.classList.add('offset')
	}

	return 0

}


/**
	* @param {Date} date day to be displayed as a header but `<div>`
	* @returns {HTMLDivElement} element with date information
*/
function createDate(date) {
	const locale = navigator.language
	const elDate = document.createElement('div')
	elDate.classList.add('date')

	const elMonth = document.createElement('span')
	elMonth.innerText = Intl.DateTimeFormat(locale, {month: 'long'}).format(date)
	elDate.appendChild(elMonth)

	const elDay = document.createElement('span')
	elDay.innerText = Intl.DateTimeFormat(locale, {day: 'numeric'}).format(date)
	elDate.appendChild(elDay)

	const elWeekday = document.createElement('span')
	elWeekday.innerText = Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)
	elDate.appendChild(elWeekday)

	return elDate
}

/**
	* @returns {HTMLAnchorElement} element that redirects to the editor
*/
function createEditorLink() {
	const elLink = document.createElement('a')
	elLink.classList.add('cell')
	elLink.classList.add('editorLink')
	elLink.innerText = 'Editor'
	elLink.title = 'Go to editor'
	elLink.addEventListener('click', () => redirect(`/u/${extractName()}/editor`))

	return elLink
}




/**
	* @param {offsetArray[]} array array containing offsets (haystack)
	* @param {Number} day day number (needle) I HATE NAMING THINGS
	* @returns {Boolean} wherther the `array` has the `day`
*/
function hasOffset(array, day) {
	return !!array.find(o => o[0] === day)
}


/**
	* @param {String} habitName name of the habit that the offset is in
	* @param {Number} day offset offset/day thingy, days since `startingDate`
	* @param {HTMLElement} element offset html to be marked with a class if successful fetch
	* @returns {Promise<0 | 1>} exitCode
*/
async function handleToggleOffset(habitName, day, element, elData) {
	let exitCode = undefined;
	if (element.classList.contains('offset')) {
		exitCode = await deleteOffset(habitName, day, element)
	} else {
		exitCode = await createOffset(habitName, day)
	}
	
	if (exitCode !== 0) {
		return exitCode
	}

	element.classList.toggle('offset')
	updateView(elData)

	return 0
}


/**
	* @param {String} habitName name of the habit that the offset is in
	* @param {Number} day offset offset/day thingy, days since `startingDate`
	* @returns {Promise<0 | 1>} exitCode
*/
async function createOffset(habitName, day) {
	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "create",
			type: "offset",
			where: habitName,
			what: [day, 1],
		}), // i am so sorry for how i name these things
	})

	const res = await fetch(req)
	
	if (res.status !== 201) {
		console.error("create offset failed", res)
		return 1
	}
	return 0

}

/**
	* @param {String} habitName name of the habit that the offset is in
	* @param {Number} day offset offset/day thingy, days since `startingDate`
	* @returns {Promise<0 | 1>} exitCode
*/
async function deleteOffset(habitName, day) {
	const name = extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "delete",
			type: "offset",
			where: habitName,
			what: day,
		}),
	})

	const res = await fetch(req)
	
	if (res.status !== 201) {
		console.error("create offset failed", res)
		return 1
	}
	return 0

}

function updateView(elParent) {
	updateColors(elParent)
	updateSumRow(elParent)
}

/**
	* @param {HTMLDivElement} elData element with the data stuff
	* @todo idea: TWO DIMENSIONAL GRADIENT!!!!!!!
*/
function updateColors(elData) {
	const elDays = elData.querySelectorAll('.day')
	const numberOfDays = +elData.style.getPropertyValue('--number-of-days')

	if (elDays.length % numberOfDays !== 0) {
		console.warn('number of day elements not divisible by provided --number-of-days', elDays.length, numberOfDays)
	}

	/** @type {Array<Array<HTMLDivElement>>} */
	const elDaysArrays = [];
	for (let i = 0; i < elDays.length; i++) {
		if (i % numberOfDays === 0) {
			elDaysArrays.push([])
		}
		const elDay = elDays[i]
		elDaysArrays.at(-1).push(elDay)
	}

	for (const elDaysArray of elDaysArrays) {
		// TODO: possibly have many functions to compute this
		let streak = 0
		for (const elDay of elDaysArray) {
			const hue = +elDay.style.getPropertyValue('--hue')
			elDay.style.setProperty('--clr-offset', Colors.gradient(streak, numberOfDays - 1, hue))
			if (elDay.classList.contains('offset')) {
				streak += 1
			} else {
				streak = 0
			}
		}
	}
}


/**
	* @param {HTMLDivElement} elParent elData, grid
*/
function createSumRow(elParent) {
	const numberOfDays = +elParent.style.getPropertyValue('--number-of-days')
	
	for (let i = 0; i < numberOfDays; i++) {
		const elSum = document.createElement('div')
		elSum.dataset.count = 0
		elSum.classList.add('bottomSum')
		elParent.appendChild(elSum)
	}

}


/**
	* @param {HTMLDivElement} elParent elData, grid
*/
function updateSumRow(elParent) {
	const elDays = elParent.querySelectorAll('.day')
	const numberOfDays = +elParent.style.getPropertyValue('--number-of-days')

	/** @type {Array<HTMLDivElement>} */
	const elSums = elParent.querySelectorAll('.bottomSum')


	/** @type {Array<Array<HTMLDivElement>>} */
	const elDaysArrays = [];
	for (let i = 0; i < elDays.length; i++) {
		if (i % numberOfDays === 0) {
			elDaysArrays.push([])
		}
		const elDay = elDays[i]
		elDaysArrays.at(-1).push(elDay)
	}

	const minLength = elDaysArrays.map(array => array.length).reduce((prev, cur) => cur > prev ? prev : cur, Infinity)

	for (let i = 0; i < minLength; i++) {
		const count = elDaysArrays.map(array => array[i]).filter(el => el.classList.contains('offset')).length
		elSums[i].dataset.count = count
	}

}



/**
	* @returns {HTMLDivElement} placeholder
	* @deprecated idk
	* @todo delete this
*/
function _createPlaceholder() {
	const el = document.createElement('div')
	el.classList.add('placeholder')
	el.innerText = 'placeholder'
	return el
}

const exitCode = await main()

console.log("exitCode:", exitCode)
