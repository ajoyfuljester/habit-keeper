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
	{name: "Max view streak"},
	{name: "Max streak"},
	{name: "Count"},
	{name: "Current streak"},

]


/** @type {statFunction} */
Stats[0].function = ({habit, dates}) => {
	let maxStreak = 0

	const days = dates.map(d => habit.dateToOffsetNumber(d))

	if (!days.some(o => !!habit.findOffset(o))) {
		return 0
	}
	
	days.sort((o1, o2) => o1 - o2)

	let streak = 1
	for (let i = 1; i < days.length; i++) {
		if (habit.findOffset(days[i]) && habit.findOffset(days[i - 1])) {
			streak++
			if (streak > maxStreak) {
				maxStreak = streak
			}
		} else {
			streak = 1
		}
	}



	return maxStreak

}

/** @type {statFunction} */
Stats[1].function = ({habit}) => {
	let maxStreak = 1

	const days = habit.offsets.map(o => o.day)
	if (days.length === 0) {
		return 0
	}

	days.sort((o1, o2) => o1 - o2)

	let streak = 1
	for (let i = 1; i < days.length; i++) {
		if (days[i] - 1 === days[i - 1]) {
			streak++
			if (streak > maxStreak) {
				maxStreak = streak
			}
		} else {
			streak = 1
		}
	}



	return maxStreak

}

/** @type {statFunction} */
Stats[2].function = ({habit}) => {
	return habit.offsets.length
}

/** @type {statFunction} */
Stats[3].function = ({habit}) => {
	const days = habit.offsets.map(o => o.day)

	if (days.length === 0) {
		return 0
	}
	days.sort((o1, o2) => o1 - o2)

	const today = habit.dateToOffsetNumber(new Date())

	let i = days.length - 1

	if (days[i] !== today) {
		return 0
	}

	let streak = 1
	while (i > 0 && (days[i] - 1 === days[i - 1])) {
		streak++
		i--
	}


	return streak
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
	* don't ask me why this function isn't in HabitView.js
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
