import { Habit } from "./Habit.js"
import { List } from "./List.js"



export class Data {

	/**
		* @typedef {Object} dataObject - object to be parsed to `Data` - `{user, habits}`
		* @property {String} dataObject.user - user name of the owner of the data
		* @property {Habit[]} [dataObject.habits=[]] - array of habits objects
		* @property {List[]} [dataObject.lists=[]] - array of lists objects
		*
		* @param {dataObject} dataObject - object to be parsed into `Data` - `{user, habits}`
		* @returns {Data} instance of `Data`, may be invalid, see `Data.valid`
	*/
	constructor({habits, lists}) {
		if (!(user && habits && lists)) {
			console.error("INVALID DATA")
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
		* @typedef {Object} rawDataObject - plain `Object` that has plain components
		* @property {String} rawDataObject.user owner of the data file
		* @property {habitObject[]?} rawDataObject.habits array of habit-like objects
		* @property {listObject[]?} rawDataObject.lists array of list-like objects
		*
		* @param {rawDataObject} rawDataObject plain `Object` with data file stuff
		* @see {@link rawDataObject}
		* @returns {Data | undefined} instance of `Data` if conversion was successful or undefined
	*/
	static autoConvert(rawDataObject) {
		/** @type {Habit[]} */
		const habits = []
		for (const habitObject of (rawDataObject.habits ?? [])) {
			const habit = Habit.autoConvert(habitObject)
			if (!habit.valid) {
				return undefined
			}
			habits.push(habit)
		}
		/** @type {Habit[]} */
		const lists = []
		for (const listObject of (rawDataObject.lists ?? [])) {
			const list = new List(listObject)
			if (!list.valid) {
				return undefined
			}
			habits.push(list)
		}
		
		return new Data({
			user: rawDataObject.user,
			habits: habits,
			lists: lists,
		})

	}

}

