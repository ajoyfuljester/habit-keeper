import { extractName, getData, dateToOffset, addDays } from './utils.js'

/**
	* @param {import('./utils.js').dataObject} data - data-like object I DON'T KNOW HOW TO WRITE DOCUMENTATION!!!!!!!!!!!!
*/
function loadHabits(data) {
	const elData = document.querySelector("#data")

	for (const habit of data.habits) {
		const elHabit = createHabit(habit, {days: [addDays(today, -1), today, addDays(today, 1)]})
		elData.appendChild(elHabit)
	}

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
	* @typedef {[Number, Number]} offsetObject two element array `[offset, value]`
	*
	* @typedef {Object} habitObject object with information about a habit
	* @property {String} habitObject.name name of the habit
	* @property {String} habitObject.startingDate starting date of the habit (ISO format: YYYY-MM-DD)
	* @property {offsetObject[]} habitObject.offsets array of two element arrays `[offset, value]`
	*
	* @typedef {Object} habitOptionsObject object additional options
	* @property {Number[]} [habitOptionsObject.days=[]] array of the days to be displayed represented as offset - relative to `habitObject.startingDate`
	*
	* @param {habitObject} habitObject object with information about a habit
	* @param {habitOptionsObject} habitOptionsObject object with additional options
	* @returns {HTMLDivElement} habit element
*/
function createHabit(habitObject, {days = []}) { // TODO: HERE!!!
	const elHabit = document.createElement('div');
	elHabit.classList.add('habit')

	const elName = document.createElement('div');
	elName.innerText(habitObject.name)

	elHabit.appendChild(elName)

	const offsets = habitObject.offsets
	offsets.sort()

	for (let day of days) {
		const elOffset = document.createElement('div');
		elHabit.appendChild(elOffset)
		if (!hasOffset(habitObject.offsets, day)) {
			continue;
		}
		elOffset.classList.add('offset')
	}



	return elHabit


}

function statistics(habitInfo) {
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


/**
	* @param {offsetObject[]} array array containing offsets (haystack)
	* @param {Number} day day number (needle) I HATE NAMING THINGS
	* @returns {Boolean} wherther the `array` has the `day`
*/
function hasOffset(array, day) {
	return !!array.find(o => o[0] === day)
}

const exitCode = await main()

console.log("exitCode:", exitCode)
