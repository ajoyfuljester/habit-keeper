import { extractName, getData, dateToOffset, addDays } from './utils.js'
import * as Colors from "./colors.js"

/**
	* @param {import('./utils.js').dataObject} data - data-like object I DON'T KNOW HOW TO WRITE DOCUMENTATION!!!!!!!!!!!!
*/
function loadHabits(data) {
	/** @type {HTMLDivElement} */
	const elData = document.querySelector("#data")
	elData.classList.add('grid-habits')

	const today = new Date();
	const days = [addDays(today, -6), addDays(today, -5), addDays(today, -4), addDays(today, -3), addDays(today, -2), addDays(today, -1), today]

	elData.style.setProperty('--number-of-days', days.length)


	elData.appendChild(_createPlaceholder())
	for (const day of days) {
		const elDay = createDate(day)
		elData.appendChild(elDay)
	}
	elData.appendChild(_createPlaceholder())

	for (const habit of data.habits) {
		createHabit(elData, habit, {days})
		elData.appendChild(createStatistics(habit))
	}

	updateColors(elData)

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
	for (const day of relativeDays) {
		const elOffset = document.createElement('div');
		elOffset.classList.add('day')
		// TODO: actually write a function to toggle an offset and maybe set value, but that's less important i think
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



function statistics(habitInfo) {
	const stats = {}
	stats.successes = habitInfo.offsets?.length


	return stats;

}
/**
	* @param {habitObject} habitInfo information about the habit
	* @returns {HTMLDivElement} statistic element
*/
function createStatistics(habitInfo) {
	const elStats = document.createElement('div')
	elStats.classList.add('stats')

	return elStats
}

function createStat(key, value) {
	const elKey = document.createElement('div');
	elKey.innerText = key
	const elValue = document.createElement('div');
	elValue.innerText = value

	return [elKey, elValue]

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
	updateColors(elData)

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

/**
	* @param {HTMLDivElement} elData element with the data stuff
	* @todo from left to right check neighbours
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
		let strike = 0
		for (const elDay of elDaysArray) {
			elDay.style.setProperty('--color-offset', Colors.gradient(strike, numberOfDays - 1))
			if (elDay.classList.contains('offset')) {
				strike += 1
			} else {
				strike = 0
			}
		}
	}
}

/**
	* @param {Number} n number of the color or something
	* @returns {String} css color as string
	* @deprecated idk how to mark this as a temporary function, it will probably evolve into a normal function
*/
function _colorsTemp(n) {
	const colors = ['#ff0', '#0f0', '#0ff', '#00f']
	return colors[n % colors.length]
}


/**
	* @returns {HTMLDivElement} placeholder
	* @deprecated idk
	* @todo delete this
*/
function _createPlaceholder() {
	const el = document.createElement('div')
	el.innerText = 'placeholder'
	return el
}

const exitCode = await main()

console.log("exitCode:", exitCode)
