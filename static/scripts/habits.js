import { Data } from './Data.js'
import { HabitView } from './HabitView.js'
import { Page } from './Page.js'
import * as Utils from './utils.js'

/**
	* @param {Data} data Data instance I DON'T KNOW HOW TO WRITE DOCUMENTATION!!!!!!!!!!!!
*/
function loadHabits(data) {
	const dates = []
	const today = new Date()
	for (let i = 0; i >= (-14 + 1); i--) {
		dates.push(Utils.addDays(today, i))
	}
	dates.reverse()

	const statIDs = [0]


	const page = new Page()

	const view = new HabitView({
		data: data,
		dates: new Utils.DateList(dates),
		statIDs: statIDs,
		page: page,
	})
	page.addView(view)

	document.body.appendChild(view.html)

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
