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
	*/
export class View {

	/**
		*
		* @param {viewObject} viewObject object with fields `habits`, `dates`, `stats`
		* @returns {View} instance of `View`
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
		const elData = document.createElement('div')
		// TODO: think if this is necessary
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

		const offsetSet = createOffsetSet({habits: this.habits, dates: this.dates})
		offsetSet.classList.add('subgrid')
		offsetSet.classList.add('view-offsets')
		elData.appendChild(offsetSet)

		const summarySet = createSummarySet({habits: this.habits, dates: this.dates})
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

	const hue = Utils.randomInteger(1, 360)
	const colorFunction = Colors.gradient(habits.length, hue)
	for (const [i, habit] of habits.entries()) {
		for (const date of dates) {
			const el = document.createElement('div')

			const offset = habit.dateToOffset(date)
			el.addEventListener('click', () => handleOffsetToggle(el, habit.name, offset))

			el.style.setProperty('--color', colorFunction(i))
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
	if (el.classList.contains('offset')) {
		return await HandleAction.offset.delete(habitName, offsetDay)
	} else {
		return await HandleAction.offset.create(habitName, offsetDay, offsetValue)
	}
}
