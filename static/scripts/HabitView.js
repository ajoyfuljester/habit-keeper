import { HandleAction } from "./action.js"
import { Habit } from "./Habit.js"
import * as HTMLUtils from "./HTMLUtils.js"
import * as Stats from "./stats.js"
import * as Utils from "./utils.js"
import * as Colors from "./colors.js"
import { Data } from "./Data.js"


/**
	* @typedef {Object} habitViewObject an object to be parsed into an instance of `HabitView`
	* @property {Data} habitViewObject.data instance of Data with the habits and lists
	* @property {DateList} habitViewObject.dates DateList created from an array of `Date`, the dates that the data will be displayed for
	* @property {Number[]} habitViewObject.statIDs array of numbers - stat ids, which will be computed and displayed
	* @property {Page} habitViewObject.page parent of the view to whichm the events will be transmitted
	*/
export class HabitView {

	/**
		*
		* @param {habitViewObject} habitViewObject object with initial fields `habits`, `dates`, `stats`
		* @returns {HabitView} instance of `HabitView`
	*/
	constructor({data, dates, statIDs, page}) {
		if (!(data && dates && (statIDs.length !== 0) && page)) {
			console.error('INVALID VIEW')
			console.warn({data, dates, statIDs, page})
		}

		this.data = data
		this.dates = dates
		this.statIDs = statIDs
		this.page = page

		this.#initiateHTML()

	}


	// IDEA: have different view layouts
	/**
		* @param {habitViewObject} habitViewObject object with fields `habits`, `dates`, `stats`, `page`
		* `this.html` will contain the generated element
		* @see {@link habitViewObject}
	*/
	#initiateHTML() {
		const elData = document.createElement('div')
		elData.id = 'data'
		elData.classList.add('layout')
		elData.classList.add('layout-default')

		elData.style.setProperty('--number-of-habits', this.data.habits.length)

		elData.style.setProperty('--number-of-dates', this.dates.length)

		elData.style.setProperty('--number-of-stats', this.statIDs.length)

		const elDateSet = HTMLUtils.createDateSet(this.dates.dates)
		elDateSet.classList.add('subgrid')
		elDateSet.classList.add('view-dates')
		elData.appendChild(elDateSet)

		const elStatSet = Stats.createStatSet({habits: this.data.habits, dates: this.dates.dates, statIDs: this.statIDs})
		elStatSet.classList.add('subgrid')
		elStatSet.classList.add('view-stats')
		elData.appendChild(elStatSet)

		const habitNameSet = createHabitNameSet(this.data.habits)
		habitNameSet.classList.add('subgrid')
		habitNameSet.classList.add('view-habit-names')
		elData.appendChild(habitNameSet)

		const offsetSet = createOffsetSet({habits: this.data.habits, dates: this.dates.dates, page: this.page})
		offsetSet.classList.add('subgrid')
		offsetSet.classList.add('view-offsets')
		elData.appendChild(offsetSet)

		const summarySet = createSummarySet({habits: this.data.habits, dates: this.dates.dates})
		summarySet.classList.add('subgrid')
		summarySet.classList.add('view-summary')
		elData.appendChild(summarySet)

		this.html = elData

	}

	/**
		* @typedef {Object} offsetCoordsObject object that contains coordinates and index of a given Offset
		* @property {Number} offsetCoordsObject.y number of the row from 0
		* @property {Number} offsetCoordsObject.x number of the column from 0
		* @property {Number} offsetCoordsObject.index number of the offset
	*/

	/**
		* @param {String} habitName name of the habit
		* @param {Number} day offset/day number relative to starting date
		* @returns {offsetCoordsObject | null} coords to the offset
	*/
	#findOffsetIndex(habitName, day) {
		const habitIndex = this.data.findHabitIndexByName(habitName)
		if (-1 === habitIndex) {
			return null
		}

		const y = habitIndex
		const date = this.data.habits[habitIndex].offsetToDate(day)
		const x = this.dates.findIndex(date)
		if (-1 === x) {
			return null
		}

		const index = (y * this.dates.length) + x

		return {x, y, index}
	}


	/**
		* @param {String} habitName name of the habit
		* @param {Number} day offset/day number relative to starting date
		* @param {Number} [value=1] value of the offset
		* @returns {0 | 1} exitCode where
		* `0` - success
		* `1` - offset not found in the view 
	*/
	setOffset(habitName, day, value = 1) {
		const coords = this.#findOffsetIndex(habitName, day)
		if (null === coords) {
			return 1
		}

		const { index } = coords

		const elOffsets = this.html.querySelector(".view-offsets")
		const elOffset = elOffsets.children.item(index)

		elOffset.classList.add('offset')


		const habit = this.data.habits[coords.y]
		const date = habit.offsetToDate(day)

		this.updateSummary(date)
		this.updateStats(habitName)


		return 0
	}


	/**
		* @param {String} habitName name of the habit
		* @param {Number} day offset/day number relative to starting date
		* @returns {0 | 1} exitCode where
		* `0` - success
		* `1` - offset not found in the view 
	*/
	deleteOffset(habitName, day) {
		const coords = this.#findOffsetIndex(habitName, day)
		if (null === coords) {
			return 1
		}

		const { index } = coords

		const elOffsets = this.html.querySelector(".view-offsets")
		const elOffset = elOffsets.children.item(index)

		elOffset.classList.remove('offset')


		const habit = this.data.habits[coords.y]
		const date = habit.offsetToDate(day)

		this.updateSummary(date)
		this.updateStats(habitName)


		return 0
	}


	/**
		* @param {Date} date date of the view to update summary idk
		* @returns {0 | 1} exitCode where
		* `0` - success
		* `1` - corresponding summary column not found in the view 
	*/
	updateSummary(date) {

		const elSummary = this.html.querySelector('.view-summary')

		const index = this.dates.findIndex(date)
		if (-1 === index) {
			return 1
		}


		const count = this.data.habits.map(h => h.findOffsetByDate(date)).filter(o => !!o).length

		elSummary.innerText = count


		return 0


	}


	/**
		* @param {String} habitName name of the hsbit, where stats should be updated
		* @returns {0 | 1} exitCode where
		* `0` - success
		* `1` - corresponding habit was not found in the view
	*/
	updateStats(habitName) {
		const row = this.data.findHabitIndexByName(habitName)
		if (-1 === row) {
			return 1
		}


		const habit = this.data.habits[row]

		const elStatSet = this.html.querySelector(".view-stats")

		for (const [ i, statID ] of this.statIDs.entries()) {
			const statValue = Stats.Stats[statID].function({habit, dates: this.dates})

			// y = statIDs.length * (row + 1), + 1 because headers
			// x = i
			const index = this.statIDs.length * (row + 1) + i
			const el = elStatSet.children[index]

			el.innerText = statValue
		}


		return 0

	}


}

/**
	* @typedef {Object} objectHabitsDates
	* @property {Habit[]} objectHabitsDates.habits array of hsbits with the data I DON'T KNOW HOW TO WRITE DOCUMENTATION
	* @property {Date[]} objectHabitsDates.dates array of dates to filter the data
	* @property {Page} objectHabitsDates.page Page object for the onclick events to propagate
*/

/**
	* @param {objectHabitsDates} objectHabitsDates habits and dates
	* @returns {HTMLDivElement} element that contains offset representation for the given habits and dates
*/
function createOffsetSet({habits, dates, page}) {
	const elOffsetSet = document.createElement('div')

	const hue = Utils.randomInteger(1, 360)
	const colorFunction = Colors.gradient(habits.length, hue)
	for (const [y, habit] of habits.entries()) {
		for (const [x, date] of dates.entries()) {
			const el = document.createElement('button')

			const offset = habit.dateToOffset(date)
			el.addEventListener('click', () => page.handleOffsetToggle(el.classList.contains("offset"), habit.name, offset))

			el.style.setProperty('--clr-offset', colorFunction({x, y}))
			elOffsetSet.appendChild(el)

			if (!habit.findOffset(offset)) {
				continue
			}

			el.classList.add('offset')

		}
	}

	return elOffsetSet

}

/**
	* @param {Habit[]} habits habits to get the name and display it
	* @returns {HTMLDivElement} element that has habit names as headers but `<span>`
*/
function createHabitNameSet(habits) {
	const elHabitNameSet = document.createElement('div')

	for (const habit of habits) {
		const el = document.createElement('span')

		el.innerText = habit.name

		elHabitNameSet.appendChild(el)
	}

	return elHabitNameSet

}


/**
	* @param {objectHabitsDates} objectHabitsDates habits and dates
	* @returns {HTMLDivElement} element that contains bottom sums
*/
function createSummarySet({habits, dates}) {
	const elSummarySet = document.createElement('div')

	for (const date of dates) {
		// let count = 0;
		//
		// for (const habit of habits) {
		// 	if (!habit.findOffsetByDate(date)) {
		// 		continue;
		// 	}
		// 	count += 1;
		// }

		const count = habits.map(h => h.findOffsetByDate(date)).filter(o => !!o).length

		const el = document.createElement('div')
		el.innerText = count;

		elSummarySet.appendChild(el)
	}


	return elSummarySet

}



// TODO: check if i can make it behave like an array
class DateList {

	/**
		* @param {Date[]} dates array of dates
	*/
	constructor(dates) {
		this.dates = dates ?? []
	}

	/**
		* @param {Date} date date for the index to be found
		* @returns {Number} index or -1 if not found
	*/
	findIndex(date) {
		const dateISO = Utils.dateToISO(date)
		const index = this.dates.findIndex(d => Utils.dateToISO(d) === dateISO)

		return index
	}

	/**
		* @returns {Number} number of the dates
	*/
	get length() {
		return this.dates.length
	}

	/**
		* @yields {Date} next date in `this.dates`
	*/
	*[Symbol.iterator]() {
		for (const date of this.dates) {
			yield date
		}
	}


}
