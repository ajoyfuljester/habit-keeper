
/**
	* @param {habitObject} habitInfo information about the habit
	* @returns {HTMLDivElement} statistic element
*/
export function createStats(habitInfo) {
	const elStats = document.createElement('div')
	elStats.classList.add('stats')

	return elStats
}


export function createStat(key, value) {
	const elKey = document.createElement('div');
	elKey.innerText = key
	const elValue = document.createElement('div');
	elValue.innerText = value

	return [elKey, elValue]

}

/**
	* @param {import("./habits").offsetArray[]} offsets array with offsets
	* @returns {Number} highest streak
*/
function calculateStreak(offsets) {
	let maxStreak = 0
	
	offsets.sort((o1, o2) => o1[0] - o2[0])

	let currentStreak = 0
	// TODO: this
	for (let i = 1; i < offsets.length; i++) {
	}

}
