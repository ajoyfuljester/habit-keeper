/**
	* @param {import("./habits").offsetArray[]} offsets array with offsets
	* @returns {Number} highest streak
*/
function calculateMaxStreak(offsets) {
	let maxStreak = 0
	
	offsets.sort((o1, o2) => o1[0] - o2[0])

	let currentStreak = 1
	// TODO: this
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
	* @callback statFunction function that computes a statistic
	* @param {import("./habits").offsetArray} array of offsets
	* @returns {Number} value of the statistic
	*
	* @typedef {Object} StatsObject
	* @property {statFunction} StatsObject.function function of the statistic
	* @property {String} StatsObject.name name of the statistic
*/

/**
	* @type {StatsObject[]} array with stuff about statistics, including a function and a name
*/
export const Stats = [
	{function: calculateMaxStreak, name: "Max streak"},
]



/**
	* @param {HTMLDivElement} elParent grid
	* @param {import("./habits").habitObject} habitInfo information about the habit
	* @param {Number[]} stats numbers corresponding to a stat that will be displayed
*/
export function createStats(elParent, offsets, statIDs) {
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

