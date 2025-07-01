import * as HTMLUtils from "./HTMLUtils.js"
import * as Stats from "./stats.js"
import * as Utils from "./utils.js"
import * as Colors from "./colors.js"
import { Offset } from "./Offset.js"


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
		const elData = this.#prepareDataElement()

		const elDateSet = HTMLUtils.createDateSet(this.dates.dates)
		prepareBaseViewElement(elDateSet, 'dates')
		elData.appendChild(elDateSet)

		const elStatSet = Stats.createStatSet({habits: this.data.habits, dates: this.dates.dates, statIDs: this.statIDs})
		prepareBaseViewElement(elStatSet, 'stats')
		elData.appendChild(elStatSet)

		const elStatHeader = createStatHeader()
		prepareBaseViewElement(elStatHeader, 'stats-header')
		elData.appendChild(elStatHeader)

		const elHabitHeader = createHabitsHeader()
		prepareBaseViewElement(elHabitHeader, 'habits-header')
		elData.appendChild(elHabitHeader)

		const elHabitNameSet = createHabitNameSet(this.data.habits)
		prepareBaseViewElement(elHabitNameSet, 'habit-names')
		elData.appendChild(elHabitNameSet)

		const elOffsetSet = createOffsetSet({habits: this.data.habits, dates: this.dates.dates, page: this.page})
		prepareBaseViewElement(elOffsetSet, 'offsets')
		elData.appendChild(elOffsetSet)

		const elSummarySet = createSummarySet({habits: this.data.habits, dates: this.dates.dates})
		prepareBaseViewElement(elSummarySet, 'summary')
		elData.appendChild(elSummarySet)

		const elEditorLink = createEditorLink()
		prepareBaseViewElement(elEditorLink, 'editor-link')
		elData.appendChild(elEditorLink)

		const elArrowLeft = createArrowLeft(this)
		prepareBaseViewElement(elArrowLeft, 'arrow-left')
		elData.appendChild(elArrowLeft)

		const elArrowRight = createArrowRight(this)
		prepareBaseViewElement(elArrowRight, 'arrow-right')
		elData.appendChild(elArrowRight)

		this.html = elData

	}


	/**
		* @returns {HTMLDivElement} main data element prepared with classes, css variables
	*/
	#prepareDataElement() {
		const elData = document.createElement('div')

		elData.classList.add('layout')
		elData.classList.add('layout-default')

		elData.style.setProperty('--number-of-habits', this.data.habits.length)
		elData.style.setProperty('--number-of-dates', this.dates.length)
		elData.style.setProperty('--number-of-stats', this.statIDs.length)


		return elData
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


		const { index, y } = coords

		const habit = this.data.habits[y]
		habit.addOffset(new Offset([day, value]))

		const elOffsets = this.html.querySelector(".view-offsets")
		const elOffset = elOffsets.children.item(index)

		elOffset.classList.add('offset')


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

		const { index, y } = coords

		const habit = this.data.habits[y]
		habit.deleteOffset(day)

		const elOffsets = this.html.querySelector(".view-offsets")
		const elOffset = elOffsets.children.item(index)

		elOffset.classList.remove('offset')


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

		console.log(Utils.dateToISO(date))

		const elSummary = this.html.querySelector('.view-summary')

		const index = this.dates.findIndex(date)
		if (-1 === index) {
			return 1
		}


		const count = this.data.habits.map(h => h.findOffsetByDate(date)).filter(o => !!o).length
		console.log(this.data.habits)
		console.log(this.data.habits.map(h => h.findOffsetByDate(date)))
		console.log(this.data.habits.map(h => h.findOffsetByDate(date)).filter(o => !!o))
		console.log(this.data.habits.map(h => h.findOffsetByDate(date)).filter(o => !!o).length)

		console.log(index)
		console.log(elSummary.children[index])

		elSummary.children[index].innerText = count

		console.log(count)


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
			const statValue = Stats.Stats[statID].function({habit, dates: this.dates.dates})

			// y = statIDs.length * (row + 1), + 1 because headers
			// x = i
			const index = this.statIDs.length * (row + 1) + i
			const el = elStatSet.children[index]

			el.innerText = statValue
		}


		return 0

	}

	/**
		* @param {Date[]} dates array of new dates
	*/
	setDates(dates) {

		this.dates = new Utils.DateList(dates)

		const elDateSet = HTMLUtils.createDateSet(this.dates.dates)
		prepareBaseViewElement(elDateSet, 'dates')

		this.html.querySelector('.view-dates').remove()
		this.html.appendChild(elDateSet)

		const elOffsetSet = createOffsetSet({habits: this.data.habits, dates: this.dates.dates, page: this.page})
		prepareBaseViewElement(elOffsetSet, 'offsets')
		this.html.querySelector('.view-offsets').remove()
		this.html.appendChild(elOffsetSet)

		for (const habitName of this.data.habits) {
			this.updateStats(habitName)
		}

		for (const date of this.dates) {
			this.updateSummary(date)
		}

	}

	/**
		* @param {Number} [offset=1] number of days to add to each date I HATE NAMING THINGS
	*/
	shiftDates(offset = 1) {
		const newDates = this.dates.dates.map(d => Utils.addDays(d, offset))

		this.setDates(newDates)
	}

}


/**
	* @param {HTMLElement} el element to which classes and stuff will be applied
	* @param {String} name class which will be prefixed with `view-` and added to the element, it's mostly for the grid
*/
function prepareBaseViewElement(el, name) {

	el.classList.add('subgrid')
	el.classList.add(`view-${name}`)

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

	const colorArray = Colors.gradient2({
		columns: dates.length,
		rows: habits.length,
		lightnessMin: 30,
		lightnessMax: 80,
		hueMin: Utils.randomInteger(1, 360),
		hueMax: Utils.randomInteger(1, 360),
	})

	for (const [y, habit] of habits.entries()) {
		for (const [x, date] of dates.entries()) {
			const el = document.createElement('button')

			const offset = habit.dateToOffsetNumber(date)
			el.addEventListener('click', () => page.handleOffsetToggle(el.classList.contains("offset"), habit.name, offset))

			const index = (y * dates.length) + x

			el.style.setProperty('--clr-offset', colorArray[index])
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


function createEditorLink() {
	const el = document.createElement('a')

	const user = Utils.extractName()
	el.href = `/u/${user}/editor`

	el.innerText = "Editor"

	return el
}


/**
	* @param {HabitView} view view needed for access to function to change dates
	* @returns {HTMLButtonElement} button for shifting the dates backward
*/
function createArrowLeft(view) {
	const elButton = document.createElement('button')
	const elSpan = document.createElement('span')

	elSpan.innerText = 'Previous'
	elButton.appendChild(elSpan)

	elButton.addEventListener('click', () => view.shiftDates(-1 * view.dates.length))

	return elButton

}

/**
	* @param {HabitView} view view needed for access to function to change dates
	* @returns {HTMLButtonElement} button for shifting the dates forward
*/
function createArrowRight(view) {
	const elButton = document.createElement('button')
	const elSpan = document.createElement('span')

	elSpan.innerText = 'Next'
	elButton.appendChild(elSpan)

	elButton.addEventListener('click', () => view.shiftDates(view.dates.length))

	return elButton

}


function createStatHeader() {
	const elWrapper = document.createElement('div')
	const elSpan = document.createElement('span')

	elSpan.innerText = "Statistics"
	elWrapper.appendChild(elSpan)

	return elWrapper
}

function createHabitsHeader() {
	const elWrapper = document.createElement('div')
	const elSpan = document.createElement('span')

	elSpan.innerText = "Habits"
	elWrapper.appendChild(elSpan)

	return elWrapper
}
