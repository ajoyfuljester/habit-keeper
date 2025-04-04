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

		elData.style.setProperty('--number-of-habits', this.habits.length)

		elData.style.setProperty('--number-of-days', this.dates.length)

		elData.style.setProperty('--number-of-stats', this.statIDs.length)

		const elDateSet = HTMLUtils.createDateSet()
		elDateSet.classList.add('subgrid')

		const elStatSet = Stats.createStatSet({habits: this.habits, dates: this.dates})
		elStatSet.classList.add('subgrid')



		for (const habit of data.habits) {
			createHabit(elData, habit, {days: this.dates})
			createStats(elData, habit.offsets, this.statIDs)
		}

		const elEditorLink = createEditorLink()
		elData.appendChild(elEditorLink)

		createSumRow(elData)

		elData.appendChild(_createPlaceholder())

		updateView(elData)

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

	loop:
	for (const habit of habits) {
		for (const date of dates) {
			const el = document.createElement('div')
			// TODO: colors

			const offset = habit.dateToOffset(date)
			if (!habit.findOffset(offset)) {
				break loop;
			}

			el.classList.add('offset')
		}
	}

}
