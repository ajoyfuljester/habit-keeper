const Stats = [
	calculateStreak,
]


/**
	* @param {HTMLDivElement} elParent grid
	* @param {import("./habits").habitObject} habitInfo information about the habit
	* @param {Number[]} stats numbers corresponding to a stat that will be displayed
*/
export function createStats(elParent, offsets, statIDs) {
	for (const id of statIDs) {
		const value = Stats[id](offsets)
		const el = document.createElement('span')
		el.innerText = value
		elParent.appendChild(el)
	}

}


function createStat(key, value) {
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
