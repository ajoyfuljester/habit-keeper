import { Habit } from "./Habit.js"


/**
	* @typedef {Object} statParams parameters for stat functions
	* @property {Habit} statParams.habit habit with the data
	* @property {Date[]} statParams.dates array of dates to filter thr data
	*
*/

/**
	* @callback statFunction function that computes a statistic
	* @param {statParams} stat parameters - habits and dates
	* @returns {Number} value of the statistic
*/
/**
	* @typedef {Object} StatsObject
	* @property {statFunction} StatsObject.function function of the statistic
	* @property {String} StatsObject.name name of the statistic
*/

/**
	* @type {StatsObject[]} array with stuff about statistics, including a function and a name
*/
export const Stats = [
	{name: "Max streak (pseudo)"},
]


/** @type {statFunction} */
Stats[0].function = ({habit, dates}) => {
	let maxStreak = 0

	const offsets = dates.map(d => habit.dateToOffsetNumber(d))

	if (!offsets.some(o => !!habit.findOffset(o))) {
		return 0
	}
	
	offsets.sort((o1, o2) => o1 - o2)

	let currentStreak = 1
	for (let i = 1; i < offsets.length; i++) {
		if (habit.findOffset(offsets[i]) && habit.findOffset(offsets[i - 1])) {
			currentStreak++
			if (currentStreak > maxStreak) {
				maxStreak = currentStreak
			}
		} else {
			currentStreak = 1
		}
	}



	return maxStreak

}



// TODO: this
// I AM SERIOUSLY QUESTIONING MY DECISION NOT TO USE CLASSES FOR THE DATAFILE ON THE CLIENT
// to be honest i am kind of surprised it took me so long
// i mean javascript setters would be great here
// TODO: this
export function updateStats(elParent) {

}



// IDEA: possibly move this funtion to HabitView
/**
	* @param {import("./HabitView.js").habitViewObject} habitViewObject information about what to display
	* @returns {HTMLDivElement} element which contains values of the stats
*/
export function createStatSet({habits, dates, statIDs}) {
	const elStatSet = document.createElement('div')

	for (const statID of statIDs) {
		const elSpan = document.createElement('span')
		elSpan.innerText = Stats[statID].name
		elStatSet.appendChild(elSpan)
	}

	for (const habit of habits) {
		for (const statID of statIDs) {
			const el = document.createElement('span')
			const statValue = Stats[statID].function({habit, dates})
			el.innerText = statValue
			elStatSet.appendChild(el)
				
		}
	}



	return elStatSet
}
