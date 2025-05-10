import { HandleAction } from "./action.js"
import { Habit } from "./Habit.js"
import * as HTMLUtils from "./HTMLUtils.js"
import * as Stats from "./stats.js"
import * as Utils from "./utils.js"
import * as Colors from "./colors.js"


/**
	* @typedef {Object} viewObject an object to be parsed into an instance of `View`
	* @property {Habit[]} viewObject.habits array of `Habit` - the data that will be displayed
	* @property {Date[]} viewObject.dates array of `Date` - the dates that the data will be displayed for
	* @property {Number[]} viewObject.statIDs array of numbers - stat ids, which will be computed and displayed
	* @property {Page} viewObject.page parent of the view to whichm the events will be transmitted
	*/
export class View {

	/**
		*
		* @param {viewObject} viewObject object with initial fields `habits`, `dates`, `stats`
		* @returns {View} instance of `View`
	*/
	constructor({habits, dates, statIDs, page}) {
		if (!(habits && dates && (statIDs.length !== 0) && page)) {
			console.error('INVALID VIEW')
			console.warn({habits, dates, statIDs, page})
		}

		this.page = page

		this.html = null
		this.#initiateHTML()

	}


	// IDEA: have different view layouts
	/**
		* @param {viewObject} viewObject object with fields `habits`, `dates`, `stats`, `page`
		* `this.html` will contain the generated element
		* @see {@link viewObject}
	*/
	#initiateHTML() {
		const elData = document.createElement('div')
		elData.id = 'data'
		elData.classList.add('layout')
		elData.classList.add('layout-default')

		elData.style.setProperty('--number-of-habits', this.habits.length)

		elData.style.setProperty('--number-of-dates', this.dates.length)

		elData.style.setProperty('--number-of-stats', this.statIDs.length)

		const elDateSet = HTMLUtils.createDateSet(this.dates)
		elDateSet.classList.add('subgrid')
		elDateSet.classList.add('view-dates')
		elData.appendChild(elDateSet)

		const elStatSet = Stats.createStatSet({habits: this.habits, dates: this.dates, statIDs: this.statIDs})
		elStatSet.classList.add('subgrid')
		elStatSet.classList.add('view-stats')
		elData.appendChild(elStatSet)

		const habitNameSet = createHabitNameSet(this.habits)
		habitNameSet.classList.add('subgrid')
		habitNameSet.classList.add('view-habit-names')
		elData.appendChild(habitNameSet)

		const offsetSet = createOffsetSet({habits: this.habits, dates: this.dates, page: this.page})
		offsetSet.classList.add('subgrid')
		offsetSet.classList.add('view-offsets')
		elData.appendChild(offsetSet)

		const summarySet = createSummarySet({habits: this.habits, dates: this.dates})
		summarySet.classList.add('subgrid')
		summarySet.classList.add('view-summary')
		elData.appendChild(summarySet)

		this.html = elData

	}



	#findOffsetIndex() {
		// TODO: HEEEEERE. COPY THE THING FROM BELOW OVER THERE

	}


	/**
		* @param {String} habitName name of the habit
		* @param {Number} day offset/day number relative to starting date
		* @param {Number} [value=1] value of the offset
		* TODO: docs return value
	*/
	setOffset(habitName, day, value = 1) {
		const habit = this.habits.find(h => h.name === habitName)
		if (!habit) {
			return 1
		}

		const y = this.habits.indexOf(habit)
		const date = habit.offsetToDate(day)
		const dateISO = Utils.dateToISO(date)
		const x = this.dates.findIndex(d => Utils.dateToISO(d) === dateISO)
		if (!x) {
			return 2
		}

		const index = (y * this.dates.length) + x + 1
		console.table({x, y, index})

		const elOffsets = this.html.querySelector("view-offsets")
		elOffsets.children.item(index)

		elOffsets.classList.add('offset')

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
			const el = document.createElement('div')

			const offset = habit.dateToOffset(date)
			// TODO: HERE! hmmm... let's try sending the request and on success propagate to the instance of Page? yea sure but what is the correct way to do it? i don't know
			el.addEventListener('click', () => page.handleOffsetToggle(el, habit.name, offset))

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
		let count = 0;

		for (const habit of habits) {
			if (!habit.findOffsetByDate(date)) {
				continue;
			}
			count += 1;
		}

		const el = document.createElement('div')
		el.innerText = count;

		elSummarySet.appendChild(el)
	}


	return elSummarySet

}

/**
	* @param {HTMLDivElement} el html element to check whether to create or delete the offset based on whether the element has a class of `offset`
	* @param {String} habitName name of the habit
	* @param {Number} offsetDay day of the offset thingy
	* @param {Number} [offsetValue=1] value of the offset thingy
	* @returns {Promise<0 | 1>} promise that resolves to the return value of the HandlAction functions
*/
async function handleOffsetToggle(el, habitName, offsetDay, offsetValue = 1) {
	let result;
	if (el.classList.contains('offset')) {
		result = await HandleAction.offset.delete(habitName, offsetDay)
	} else {
		result = await HandleAction.offset.create(habitName, offsetDay, offsetValue)
	}

	if (result !== 0) {
		return result
	}

	// TODO: update stuff


	return result
}
