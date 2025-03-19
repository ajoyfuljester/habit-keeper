import { Offset } from "./Offset.js"


export class Habit {
	/**
		* @param {import("./habits").habitObject} habitObject - `{name, startingDate, offsets}`
		* @returns {Habit} instance of `Habit`, possibly invalid, see `Habit.valid`
		* @see {@link habitObject}
	*/
	constructor({name, startingDate, offsets}) {
		if (!(name && startingDate && offsets)) {
			console.error('INVALID HABIT')
		}

		/** @type {String} name of the habit */
		this.name = name
		/** @type {String} date of the start of the habit in ISO format (YYYY-MM-DD) */
		this.startingDate = startingDate


		/** @type {Offset[]} array of `Offsets` */
		this.offsets = offsets



	}

	/** @returns {import("./habits").habitObject} a simple object that is jsonifable */
	toJSON() {
		return {
			name: this.name,
			startingDate: this.startingDate,
			offsets: this.offsets,
		}
	}



	/**
		* @param {Number} offset - offset offset/day WHY WHY WHY WHY WHY DO I NAME THESE THINGS LIKE THAT WHY CANT I CHANGE
		* @returns {Offset | undefined} `Offset` instance if found or `undefined` if offset was not found
	*/
	findOffset(offset) {
		return this.offsets.find(o => o.day === offset)
	}

	/**
		* @param {Offset} offset - a `Offset` that will be added to this `Habit` instance
		* @returns {0 | 1 | 2} exitCode - execution exit status
		* `0` - successfuly added the offset to this instance of `Habit`
		* `1` - parameter `offset` is not an instance of `Offset` class
		* `2` - offset with the offset of the given `offset` already exists :sob:
	*/
	addOffset(offset) {
		if (!(offset instanceof Offset)) {
			return 1
		}
		if (this.findOffset(offset.day)) {
			return 2
		}

		this.offsets.push(offset)
		return 0
	}

	/**
		* @param {Number} day - day offset to be deleted
		* @returns {0 | 1} exitCode - execution exit status
		* `0` - successfuly deleted the offset
		* `1` - `Offset` with this `day` does not exist
	*/
	deleteOffset(day) {
		const index = this.offsets.findIndex(o => o.day === day)
		if (index === -1) {
			return 1
		}

		this.offsets.splice(index, 1)
		return 0
	}

	/**
		* @typedef {Object} rawHabitObject - plain `Object` that has plain components
		* @property {String} rawHabitObject.name name of the habit
		* @property {String?} rawHabitObject.startingDate date from which the habit
		* @property {offsetArray[]?} rawHabitObject.offsets array of offset-like arrays - `[offset, value]` defaults to empty array
		* @see {@link offsetArray}
		*
		* @param {rawHabitObject} rawHabitObject plain `Object` with habit stuff
		* @see {@link rawHabitObject}
		* @returns {Habit | undefined} `Habit` if conversion was successful or undefined
	*/
	static autoConvert(rawHabitObject) {
		/** @type {Offset[]} */
		const offsets = []
		for (const offsetArray of (rawHabitObject.offsets ?? [])) {
			const offset = new Offset(offsetArray)
			if (!offset.valid) {
				return undefined
			}
			offsets.push(offset)
		}
		return new Habit({
			name: rawHabitObject.name,
			startingDate: rawHabitObject.startingDate,
			offsets: offsets,
		})

	}

	#initiateHTML() {
		const el = document.createElement('div')





		return el
	}
	
}
