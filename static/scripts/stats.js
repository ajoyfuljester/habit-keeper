import { Habit } from "./Habit.js"


/**
	* @typedef {Object} statParams parameters for stat functions
	* @property {Habit} statParams.habit habit with the data
	* @property {Date[]} statParams.dates arrayof dates to filter thr data
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
const Stats = [
	{name: "Max streak"},
]


/** @type {statFunction} */
Stats[0].function = ({habit, dates}) => {
	let maxStreak = 0

	const offsets = dates.map(d => habit.dateToOffset(d))

	if (!offsets.some(o => !!habit.findOffset(o))) {
		return 0
	}
	
	offsets.sort((o1, o2) => o1[0] - o2[0])

	let currentStreak = 1
	for (let i = 1; i < offsets.length; i++) {
		if (offsets[i][0] - 1 === offsets[i - 1][0]) {
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


/**
	* @param {import("./habits.js.old").habitObject} habitInfo information about the habit
	* @param {Number[]} stats numbers corresponding to a stat that will be displayed
*/
export function createStats(offsets, statIDs) {
	for (const id of statIDs) {
		const value = Stats[id].function(offsets)
		const el = document.createElement('span')
		el.innerText = value
		elParent.appendChild(el)
	}

}

// TODO: this
// I AM SERIOUSLY QUESTIONING MY DECISION NOT TO USE CLASSES FOR THE DATAFILE ON THE CLIENT
// to be honest i am kind of surprised it took me so long
// i mean javascript setters would be great here
// TODO: this
export function updateStats(elParent) {

}



/**
	* @param {import("./View").viewObject} viewObject information about what to display
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
