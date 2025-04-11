import { Habit } from "./Habit.js"
import { List } from "./List.js"
import * as HTMLUtils from "./HTMLUtils.js"

/**
	* @typedef {Object} rawDataObject - plain `Object` that has plain components
	* @property {habitObject[]?} rawDataObject.habits array of habit-like objects
	* @property {listObject[]?} rawDataObject.lists array of list-like objects
	*
*/


export class Data {

	/**
		* @typedef {Object} dataObject - object to be parsed to `Data` - `{user, habits}`
		* @property {Habit[]} [dataObject.habits=[]] - array of habits objects
		* @property {List[]} [dataObject.lists=[]] - array of lists objects
		*
		* @param {dataObject} dataObject - object to be parsed into `Data` - `{user, habits}`
		* @returns {Data} instance of `Data`, may be invalid, see `Data.valid`
	*/
	constructor({habits, lists}) {
		if (!(habits && lists)) {
			console.error("INVALID DATA")
			console.warn({habits, lists})
		}

		/** @type {Habit[]} array of `Habit` */
		this.habits = habits
		/** @type {List[]} array of `List` */
		this.lists = lists
	}

	/** @returns {dataObject} data-like object */
	toJSON() {
		return {
			habits: this.habits,
			lists: this.lists,
		}
	}

	/**
		* @param {String} name - name of the habit
		* @returns {Habit | undefined} `Habit` instance if found or `undefined` if habit was not found
	*/
	findHabit(name) {
		return this.habits.find(b => b.name === name)
	}

	/**
		* @param {String} name - name of the habit
		* @returns {-1 | Number} index of the found habit or -1 if not found
	*/
	#findHabitIndex(name) {
		return this.habits.findIndex(b => b.name === name)
	}

	/**
		* @param {String} name name of the habit
		* @returns {0 | 1} exitCode - execution exit status
		* `0` - successfuly added the habit to this instance of `Data`
		* `1` - habit with the given name does not exist
	*/
	removeHabit(name) {
		const index = this.#findHabitIndex(name)
		if (index === -1) {
			return 1
		}
		console.log(this.habits)
		this.habits.splice(index, 1)
		console.log(this.habits)
		return 0
	}

	/**
		* @param {Habit} habitObj - a `Habit` that will be added to this `Data` instance
		* @returns {0 | 1 | 2} exitCode - execution exit status
		* `0` - successfuly added the habit to this instance of `Data`
		* `1` - parameter `habitObj` is not an instance of `Habit` class
		* `2` - habit with the name of the given `habitObj` already exists
	*/
	addHabit(habitObj) {
		if (!(habitObj instanceof Habit)) {
			return 1
		}
		if (this.findHabit(habitObj.name)) {
			return 2
		}

		this.habits.push(habitObj)
		return 0
	}

	/**
		* @param {rawDataObject} rawDataObject plain `Object` with data file stuff
		* @see {@link rawDataObject}
		* @returns {Data} instance of `Data` if conversion was successful or undefined
	*/
	static autoConvert(rawDataObject) {
		/** @type {Habit[]} */
		const habits = []
		for (const habitObject of (rawDataObject.habits ?? [])) {
			const habit = Habit.autoConvert(habitObject)
			habits.push(habit)
		}
		/** @type {Habit[]} */
		const lists = []
		for (const listObject of (rawDataObject.lists ?? [])) {
			const list = new List(listObject)
			habits.push(list)
		}
		
		return new Data({
			habits: habits,
			lists: lists,
		})

	}

	#initiateHTML() {

		/** @type {HTMLDivElement} */
		this.html = document.createElement('div')
		this.html.classList.add(`data`)
		this.html.classList.add('grid-habits')

		this.html.style.setProperty('--number-of-habits', this.habits.length)

		// TODO handle this whatever
		const today = new Date();
		const days = [addDays(today, -6), addDays(today, -5), addDays(today, -4), addDays(today, -3), addDays(today, -2), addDays(today, -1), today]

		this.html.style.setProperty('--number-of-dates', days.length)

		const statsIDs = [0]

		this.html.style.setProperty('--number-of-stats', statsIDs.length)

		this.html.appendChild(_createPlaceholder())

		for (const day of days) {
			const elDay = Data.createDate(day)
			this.html.appendChild(elDay)
		}

		for (const _ of statsIDs) {
			this.html.appendChild(_createPlaceholder())
		}

		this.html.appendChild(_createPlaceholder())

		for (const id of statsIDs) {
			const el = document.createElement('span')
			el.innerText = Stats[id].name
			this.html.appendChild(el)

		}

		for (const habit of this.habits) {
			// TODO HERE
			createHabit(elData, habit, {days})
			createStats(elData, habit.offsets, statsIDs)
		}

		const elEditorLink = HTMLUtils.createEditorLink()
		this.html.appendChild(elEditorLink)


		for (let i = 0; i < days.length; i++) {
			// TODO this should be its own class? maybe? not class but something
			const elSum = document.createElement('div')
			elSum.dataset.count = 0
			elSum.classList.add('bottomSum')
			elParent.appendChild(elSum)
		}

		this.html.appendChild(_createPlaceholder())

		updateView(elData)

		return elData
	}


	/**
		* @param {Date} date day to be displayed as a header but `<div>`
		* @returns {HTMLDivElement} element with date information
	*/
	static createDate(date) {
		const locale = navigator.language
		const elDate = document.createElement('div')
		elDate.classList.add('date')

		const elMonth = document.createElement('span')
		elMonth.innerText = Intl.DateTimeFormat(locale, {month: 'long'}).format(date)
		elDate.appendChild(elMonth)

		const elDay = document.createElement('span')
		elDay.innerText = Intl.DateTimeFormat(locale, {day: 'numeric'}).format(date)
		elDate.appendChild(elDay)

		const elWeekday = document.createElement('span')
		elWeekday.innerText = Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)
		elDate.appendChild(elWeekday)

		return elDate

	}

}

