import { tokenResponse, getDataFile, setDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { validateHabit, validateOffset, validateData } from "./validation.js";




/**
	* @typedef {Object} actionBody - `body` of a `Request` object with information about the action
	* @property {"create"} actionBody.action - action to be done
	* @property {"habit" | "list"} actionBody.type - type of the object to be modified
	* @property {habitObject | offsetArray} actionBody.what - thing that will be actioned
	* @property {habitObject} actionBody.toWhat - the expected state after the action or something
	* @property {habitObject?} actionBody.where - where thing that will be actioned
	*
	*
	* @param {Request} req - request from the client
	* @param {*} _info - i have no idea what this is
	* @param {*} params - i don't know what this is, but it has `pathname.groups` stuff
	*
	* @returns {Promise<Response>} response back to the client
*/
export async function handleDataAction(req, _info, params) {
	const res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]
	
	if (await getDataFile(name) === "null") {
		return new Response("not found: data file, please initialize", {status: 400})
	}
	

	/** @type {actionBody} */
	const body = await req.json()

	// TODO: i hate the way this is done, but i'm afraid that if i do it tge other way, returning errors will be hard
	if (body.type === "habit") {
		if (body.action === "create") {
			const exitData = await Action.habit.create(name, body.what)
			if (exitData[0] === 0) {
				return new Response("success", {status: 201})
			}
			return new Response(`failure: could not create a habit, exited with data: ${exitData}`, {status: 400})
		} else if (body.type === "rename") {
			const exitData = await Action.habit.rename(name, body.what, body.toWhat)
			if (exitData[0] === 0) {
				return new Response("success", {status: 201})
			}
			return new Response(`failure: could not rename a habit, exited with data: ${exitData}`, {status: 400})
		}
	} else if (body.type === "offset") {
		if (body.action === "create") {
			const exitData = await Action.offset.create(name, body.where, body.what)
			if (exitData[0] === 0) {
				return new Response("success", {status: 201})
			}
			return new Response(`failure: could not create an offset, exited with data: ${exitData}`, {status: 400})
		} else if (body.action === "delete") {
			const exitData = await Action.offset.delete(name, body.where, body.what)
			if (exitData[0] === 0) {
				return new Response("success", {status: 201})
			}
			return new Response(`failure: could not delete an offset, exited with data: ${exitData}`, {status: 400})
		}

	}
	console.log(res, body)
	return new Response("not found: schema for this action", {status: 400})
}


/**
	* @typedef {Object} Action object with types of objects, which have functions with actions that user can perform using requests
	* @property {Object} Action.habit object with functions with actions that user can perform using requests on habits
	* @property {actionHabitCreate} Action.habits.create creates a habit with data (see {@link actionHabitCreate})
	* @property {Object} Action.offset object with functions with actions that user can perform using requests on offsets
	* @property {actionOffsetCreate} Action.offset.create creates an offset with data
*/


/**
	* @type {Action}
	* @see {@link Action}
*/
const Action = {
	habit: {},
	offset: {},
}

/**
	* @callback actionHabitCreate - adds a habit to a datafile
	* @param {String} userName - owner of the file 
	* @param {habitObject} habitObject - habit-like object with information about the habit
	* @returns {Promise<[step: Number, code: Number]>} exitData
	*
	* @type {actionHabitCreate}
*/
Action.habit.create = async (userName, habitObject) => {
	const data = await Data.fromFile(userName)

	const habit = new Habit(habitObject)
	if (!habit.valid) {
		return [1, habit.validation]
	}

	const addingCode = data.addHabit(habit)

	if (addingCode !== 0) {
		return [2, addingCode]
	}

	data.writeFile()
	return [0, 0]
}


/**
	* @callback actionOffsetCreate - adds an offset to a habit
	* @param {String} userName - owner of the file 
	* @param {String} habitName - name of the habit to put the offset in
	* @param {offsetArray} offsetArray - offset-like array with data
	* @returns {Promise<[step: Number, code: Number]>} exitData
	*
	* @type {actionOffsetCreate}
*/
Action.offset.create = async (userName, habitName, offsetArray) => {
	const data = await Data.fromFile(userName)

	const offset = new Offset(offsetArray)
	if (!offset.valid) {
		return [1, offset.validation]
	}

	const habit = data.findHabit(habitName)
	if (!habit) {
		return [3, habitName]
	}

	const addingCode = habit.addOffset(offset)
	if (addingCode !== 0) {
		return [2, addingCode]
	}

	data.writeFile()
	return [0, 0]
}


/**
	* @callback actionOffsetDelete - deletes an offset to a habit
	* @param {String} userName - owner of the file 
	* @param {String} habitName - name of the habit to put the offset in
	* @param {Number} day - day offset thing to be deleted
	* @returns {Promise<[step: Number, code: Number]>} exitData
	*
	* @type {actionOffsetDelete}
*/
Action.offset.delete = async (userName, habitName, day) => {
	const data = await Data.fromFile(userName)

	const habit = data.findHabit(habitName)
	if (!habit) {
		return [3, habitName]
	}

	const deletingCode = habit.deleteOffset(day)
	if (deletingCode !== 0) {
		return [2, deletingCode]
	}

	data.writeFile()
	return [0, 0]
}







class Data {

	/**
		* @typedef {Object} dataObject - object to be parsed to `Data` - `{user, habits}`
		* @property {String} dataObject.user - user name of the owner of the data
		* @property {Habit[]} [dataObject.habits=[]] - array of habits objects
		* @property {List[]} [dataObject.lists=[]] - array of lists objects
		*
		* @param {dataObject} dataObject - object to be parsed into `Data` - `{user, habits}`
		* @returns {Data} instance of `Data`, may be invalid, see `Data.valid`
	*/
	constructor({user, habits = [], lists = []}) {
		this.valid = false
		// TODO: think about rewriting this validation
		this.validation = validateData(JSON.stringify(this))
		if (this.validation[0] !== 0) {
			return this
		}
		this.valid = true

		/** @type {String} user name of the owner of the data file */
		this.user = user
		/** @type {Habit[]} array of `Habit` */
		this.habits = habits
		/** @type {List[]} array of `List` */
		this.lists = lists
	}

	/** @returns {dataObject} data-like object */
	toJSON() {
		return {
			user: this.user,
			habits: this.habits,
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


	/**
		* @param {String} userName - user name of the owner of the data file to be loaded and parsed into `Data` instance
		* @returns {Promise<Data>} dataObject - instance of `Data`
		* @todo think about this - redundant?
	*/
	static async fromFile(userName) {
		const json = await getDataFile(userName)
		const dataObject = JSON.parse(json)
		dataObject.user = userName
		const data = Data.autoConvert(dataObject)
		return data
	}

	/**
		* writes the data file to the user specified by `this.user`
	*/
	writeFile() {
		const obj = this.toJSON()
		delete obj.user

		const json = JSON.stringify(obj)
		setDataFile(this.user, json)
	}


}



// TODO: write this, but maybe later
class List {
	constructor() {
		this.valid = true

	}

	toJSON() {

	}
}


/**
	* @typedef {Object} habitObject an object to be parsed into an instance of `Habit`
	* @property {String} habitObject.name name of the habit
	* @property {String} [habitObject.startingDate=dateToISO()] date from which the habit
	* @property {Offset[]} [habitObject.offsets=[]] array of `Offset`
	* @see {@link Offset}
*/
class Habit {
	/**
		* @param {habitObject} habitObject - `{name, startingDate, offsets}`
		* @returns {Habit} instance of `Habit`, possibly invalid, see `Habit.valid`
		* @see {@link habitObject}
	*/
	constructor({name, startingDate = dateToISO(), offsets = []}) {
		/** @type {Boolean} whether the instance valid */
		this.valid = false

		/** @type {Number} validation state (0 is valid) */
		this.validation = validateHabit({name, startingDate, offsets})
		if (this.validation !== 0) {
			return this
		}
		this.valid = true

		/** @type {String} name of the habit */
		this.name = name
		/** @type {String} date of the start of the habit in ISO format (YYYY-MM-DD) */
		this.startingDate = startingDate


		/** @type {Offset[]} array of `Offsets` */
		this.offsets = offsets
	}

	/** @returns {habitObject} a simple object that is jsonifable */
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
		* @returns {0 | 1 | 2} exitCode - execution exit status
		* `0` - successfuly deleted the offset
		* `1` - parameter `day` is not an integer
		* `2` - `Offset` with this `day` does not exist
	*/
	deleteOffset(day) {
		if (!Number.isInteger(day)) {
			return 1
		}

		const index = this.offsets.findIndex(o => o.day === day)
		if (index === -1) {
			return 2
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
	
}



class Offset {
	/**
		* @typedef {[offset: Number, value: Number]} offsetArray - an object to be parsed into an instance of `Offset`
		* @param {offsetArray} offsetArray `[offset, value]` 
		* @returns {Offset} instance of `Offset`, possibly invalid, check `Offset.valid`
	*/
	
	constructor([offset, value]) {
		/** @type {Boolean} whether the instance valid */
		this.valid = false

		/** @type {Number} validation state (0 is valid) */
		this.validation = validateOffset([offset, value])
		if(this.validation !== 0) {
			return this
		}
		this.valid = true

		/** @type {Number} offset in days from `startingDate` */
		this.day = offset;
		/** @type {Number} value of the day */
		this.value = value;

	}



	/**
		* @returns {[offset: Number, value: Number]} a simple object that is jsonifable
	*/
	toJSON() {
		return [this.day, this.value]
	}

}

