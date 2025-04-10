import { Habit } from "./Habit.js"
import * as HTMLUtils from "./HTMLUtils.js"
import * as Stats from "./stats.js"


/**
	* @typedef {Object} viewObject an object to be parsed into an instance of `View`
	* @property {Habit[]} viewObject.habits array of `Habit` - the data that will be displayed
	* @property {Date[]} viewObject.dates array of `Date` - the dates that the data will be displayed for
	* @property {Number[]} viewObject.statIDs array of numbers - stat ids, which will be computed and displayed
	*/
export class View {

	/**
		*
		* @param {viewObject} viewObject object with fields `habits`, `dates`, `stats`
		* @returns {Offset} instance of `Offset`
	*/
	constructor({habits, dates, statIDs}) {
		if (!(habits && dates && (statIDs.length !== 0))) {
			console.error('INVALID VIEW')
			console.warn({habits, dates, statIDs})
		}

		/** @type {Habit[]} habits that will be displayed */
		this.habits = habits
		/** @type {Date[]} dates that will be displayed */
		this.dates = dates
		/** @type {Number[]} ids of stats that will be displayed */
		this.statIDs = statIDs
	}

	// IDEA: have different view layouts

	initiateHTML() {
		const elData = document.querySelector("#data")
		elData.classList.add('grid-habits')
		elData.classList.add('layout-default')

		elData.style.setProperty('--number-of-habits', this.habits.length)

		elData.style.setProperty('--number-of-dates', this.dates.length)

		elData.style.setProperty('--number-of-stats', this.statIDs.length)

		const elDateSet = HTMLUtils.createDateSet()
		elDateSet.classList.add('subgrid')
		elDateSet.classList.add('view-dates')
		elData.appendChild(elDateSet)

		const elStatSet = Stats.createStatSet({habits: this.habits, dates: this.dates})
		elStatSet.classList.add('subgrid')
		elStatSet.classList.add('view-stats')
		elData.appendChild(elStatSet)

		const habitNameSet = createHabitNameSet({habits, dates})
		habitNameSet.classList.add('subgrid')
		habitNameSet.classList.add('view-habit-names')
		elData.appendChild(habitNameSet)

		const offsetSet = createOffsetSet({habits, dates})
		offsetSet.classList.add('subgrid')
		offsetSet.classList.add('view-offsets')
		elData.appendChild(offsetSet)

		const summarySet = createSummarySet({habits, dates})
		summarySet.classList.add('subgrid')
		summarySet.classList.add('view-summary')
		elData.appendChild(summarySet)


		return elData


	}


}

/**
	* @typedef {Object} objectHabitsDates
	* @property {Habit[]} objectHabitsDates.habits array of hsbits with the data I DON'T KNOW HOW TO WRITE DOCUMENTATION
	* @property {Date[]} objectHabitsDates.dates array of dates to filter the data
*/

/**
	* @param {objectHabitsDates} objectHabitsDates habits and dates
	* @returns {HTMLDivElement} element that contains offset representation for the given habits and dates
*/
function createOffsetSet({habits, dates}) {
	const elOffsetSet = document.createElement('div')

	for (const habit of habits) {
		for (const date of dates) {
			const el = document.createElement('div')
			// TODO: colors

			if (!habit.findOffsetByDate(date)) {
				continue
			}

			el.classList.add('offset')

			elOffsetSet.appendChild(el)
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
