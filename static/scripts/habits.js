import { Data } from './Data.js'
import * as Utils from './utils.js'
import { View } from './View.js'

/**
	* @param {Data} data Data instance I DON'T KNOW HOW TO WRITE DOCUMENTATION!!!!!!!!!!!!
*/
function loadHabits(data) {
	const dates = []
	const today = new Date()
	for (let i = 0; i >= -6; i--) {
		dates.push(Utils.addDays(today, i))
	}
	dates.reverse()

	const statIDs = [0]

	const view = new View({habits: data.habits, dates: dates, statIDs: statIDs})

	const elData = view.initiateHTML()

	document.body.appendChild(elData)

}

async function main() {
	const rawData = await Utils.getData()
	// TODO: TEMPORARY, FIX THIS (server probably? maybe outdated file -> make a function to update files like these?)
	rawData.lists ??= []
	if (!rawData) {
		return 1
	}

	console.log(rawData)

	const data = Data.autoConvert(rawData)

	loadHabits(data)

	return 0
}

const exitCode = await main()

console.log("exitCode:", exitCode)
