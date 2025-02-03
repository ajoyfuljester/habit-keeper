import { tokenResponse, getDataFile, setDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { validateHabit, validateOffset, validateData } from "./validation.js";




/**
	* @typedef {Object} actionBody - `body` of a `Request` object with information about the action
	* @property {"create"} actionBody.action - action to be done
	* @property {"habit" | "list"} actionBody.type - type of the object to be modified
	* @property {habitObject} actionBody.what - thing that will be actioned
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
	if (body.action === "create") {
		if (body.type === "habit") {
			const exitData = await Action.habits.create(name, body.what)
			if (exitData[0] === 0) {
				return new Response("success", {status: 201})
			}
			return new Response(`failure: could not create a habit, exited with data: ${exitData}`, {status: 400})
		}
	}
	console.log(res, body)
	return new Response("not found: schema for this action", {status: 400})
}


/**
	* @typedef {Object} Action object with types of objects, which have functions with actions that user can perform using requests
	* @property {Object} Action.habits object with functions with actions that user can perform using requests
	* @property {actionHabitsCreate} Action.habits.create creates a habit with data (see {@link actionHabitsCreate})
*/


/**
	* @type {Action}
	* @see {@link Action}
*/
const Action = {
	habits: {},
}

/**
	* @callback actionHabitsCreate - adds a habit to a datafile
	* @param {String} userName - owner of the file 
	* @param {habitObject} habitObject - habit-like object with information about the habit
	* @returns {Promise<[step: Number, code: Number]>} exitData
*/
Action.habits.create = async (userName, habitObject) => {
	const data = await Data.fromFile(userName)
	// should data file be validated???? it's only accessed by server so it shouldn't be invalid

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









class Data {

	/**
		* @typedef {Object} dataObject - object to be parsed to `Data` - `{user, habits}`
		* @property {String} dataObject.user - user name of the owner of the data
		* @property {habitObject[]} [dataObject.habits=[]] - array of habit-like objects
		* @property {listObject[]} [dataObject.lists=[]] - array of list-like objects
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
		this.habits = habits.map(h => Habit(h))
		/** @type {List[]} array of `List` */
		this.lists = lists.map(l => List(l))
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
		* @param {String} userName - user name of the owner of the data file to be loaded and parsed into `Data` instance
		* @returns {Promise<Data>} dataObject - instance of `Data`
		* @todo think about this - redundant?
	*/
	static async fromFile(userName) {
		const json = await getDataFile(userName)
		const data = new Data(json)
		data.user = userName
		console.log("fromFile", data)
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

	}

	toObject() {

	}
}


/**
	* @typedef {Object} habitObject an object to be parsed into an instance of `Habit`
	* @property {String} habitObject.name name of the habit
	* @property {String} [habitObject.startingDate=dateToISO()] date from which the habit
	* @property {offsetArray[]} [habitObject.offsets=[]] array of offset-like arrays - `[offset, value]` defaults to empty array
	* @see {@link offsetArray}
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
		this.offsets = offsets.map(Offset)
	}

	/** @returns {habitObject} a simple object that is jsonifable */
	toJSON() {
		return {
			name: this.name,
			startingDate: this.startingDate,
			offsets: this.offsets,
		}
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
		this.offset = offset;
		/** @type {Number} value of the day */
		this.value = value;

	}



	/**
		* @returns {[offset: Number, value: Number]} a simple object that is jsonifable
	*/
	toJSON() {
		return [this.offset, this.value]
	}

}

