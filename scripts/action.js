import { tokenResponse, getDataFile, setDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { validateHabit, validateOffset, validateStringResponse, validateBoard, validateData } from "./validation.js";




/**
	* @param {Request} req - request from the client
	* @param {*} _info - i have no idea what this is
	* @param {*} params - i don't know what this is, but it has `pathname.groups` stuff
	*
	* @returns {Promise<Response>} response back to the client
*/
export async function handleDataAction(req, _info, params) {
	let res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]


	
	const body = await req.json()

	// TODO: i hate the way this is done, but i'm afraid that if i do it tge other way, returning errors will be hard
	if (body.action === "create") {
		if (body.type === "board") { // the second `what` shall be `toWhat`
			const exitData = await Action.boards.create(name, body)
			console.log("exitData (action)", exitData)
			if (exitData[0] === 0) {
				res = new Response("success", {status: 201})
			} else {
				res = new Response(`action failed, exitData: ${exitData}`, {status: 400})
			}
		} else if (body.type === "habit") {
				const exitData = Action.habits.create(name, body)
			}
	} else {
		res = new Response("not found: schema for this action", {status: 400})
	}

	console.log(res, body)

	return res
}


/**
	* @typedef {Object} Action object with types of objects, which have functions with actions that user can perform using requests
	* @property {Object} Action.boards object with functions with actions that user can perform using requests
	* @property {actionBoardsCreate} Action.boards.create creates a board with data (see {@link actionBoardsCreate})
	* @property {Object} Action.habits object with functions with actions that user can perform using requests
	* @property {actionHabitsCreate} Action.habits.create creates a habit with data (see {@link actionHabitsCreate})
*/


/**
	* @type {Action}
	* @see {@link Action}
*/
const Action = {
	boards: {},
	habits: {},
}


/**
	* @callback actionHabitsCreate creates a habit with data ``
	* @param {String} userName - user name
	* @param {Object} requestBody - body of the request with info about the action
	* @param {String} requestBody.what - habit-like object
	* @param {String} requestBody.where - name of the board that will be the parent of the habit
*/
Action.habits.create = async (userName, {what, where}) => {
	const data = await Data.fromFile(userName)
	const board = data.findBoard(where)
	const exitStatus = [0, 0]
	if (!board) {
		exitStatus[0] = 1
		exitStatus[1] += 1
		return exitStatus
	}

	const habit = new Habit(what)
	if (!habit.valid) {
		exitStatus[0] = habit.validation
		exitStatus[1] += 1
		return exitStatus
	}

	const addingCode = board.addHabit(habit)
	if (addingCode !== 0) {
		exitStatus[0] = addingCode
		exitStatus[1] += 1
		return exitStatus
	}

	data.writeFile()
	return exitStatus
}


class Data {

	/**
		* @typedef {Object} dataObject - object to be parsed to `Data` - `{user, boards}`
		* @property {String} dataObject.user - user name of the owner of the data
		* @property {boardObject[]} [dataObject.boards=[]] - array of board-like objects
		*
		* @param {dataObject} dataObject - object to be parsed into `Data` - `{user, boards}`
		* @returns {Data} instance of `Data`, may be invalid, see `Data.valid`
	*/
	constructor({user, boards = []}) {
		this.valid = false
		// TODO: think about rewriting this validation
		this.validation = validateData(JSON.stringify({user, boards}))
		if (this.validation[0] !== 0) {
			return this
		}
		this.valid = true

		/** @type {String} user name of the owner of the data file */
		this.user = user
		/** @type {Board[]} array of `Board` */
		this.boards = boards.map(b => Board(b))
	}

	/** @returns {dataObject} data-like object */
	toObject() {
		return {
			user: this.user,
			boards: this.boards.map(b => b.toObject()),
		}
	}

	/**
		* @param {String} name - name of the board
		* @returns {Board | undefined} `Board` instance if found or `undefined` if board was not found
	*/
	findBoard(name) {
		return this.boards.find(b => b.name === name)
	}

	/**
		* @param {Board} boardObj - a `Board` that will be added to this `Data` instance
		* @returns {0 | 1} exitCode - execution exit status
		* `0` - successfuly added the board to this instance of `Data`
		* `1` - parameter `boardObj` is not an instance of `Board` class
		* `2` - board with the name of the given `boardObj` already exists
	*/
	addBoard(boardObj) {
		if (!(boardObj instanceof Board)) {
			return 1
		}
		if (this.findBoard(boardObj.name)) {
			return 2
		}

		this.boards.push(boardObj)
		return 0
	}

	/**
		* @param {String} json - string with board information, the same as {@link addBoard}
		* @returns {0 | 1} exitCode - see {@link addBoard}
	*/
	jsonAddBoard(json) {
		const obj = JSON.parse(json)
		const board = new Board(obj)
		return this.addBoard(board)
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
		const obj = this.toObject()
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
	toObject() {
		return {
			name: this.name,
			startingDate: this.startingDate,
			offsets: this.offsets.map(o => o.toObject())
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
	toObject() {
		return [this.offset, this.value]
	}

}

