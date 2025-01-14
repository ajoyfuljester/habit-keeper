import { tokenResponse, getDataFile } from "./data.js";
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

	if (body.action === "create") {
		if (body.type === "board") { // the second `what` shall be `toWhat`
			const exitCode = await Action.boards.create(name, body.what)
			console.log("exitCode (action)", exitCode)
			if (exitCode === 0) {
				res = new Response("success", {status: 201})
			} else {
				res = validateStringResponse(exitCode)
			}
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
*/


/**
	* @type {Action}
	* @see {@link Action}
*/
const Action = {
	boards: {},
}


/**
	* @callback actionBoardsCreate creates a board with data `rawBoard` in data file of `userName`
	* @param {String} userName - user name
	* @param {String} rawBoard - raw json board
	* @returns {Promise<Number>} exitCode - execution exit code
*/

Action.boards.create = async (userName, rawBoard) => {
	const data = await Data.fromFile(userName)
	console.log(data)
	console.log(rawBoard)
	const exitCode = data.addBoard(new Board(rawBoard))
	// TODO: handle exit codes...
	
	return exitCode
}


class Data {

	/**
		* @param {Object} param0 - object to be parsed to `Data` - `{user, boards}`
		* @param {String} param0.user - user name of the owner of the data
		* @param {boardObject[]} param0.boards - array of board-like objects
	*/
	constructor({user, boards}) {
		this.valid = false
		this.validation = validateData(json)
		if (this.validation[0] !== 0) {
			return this
		}
		this.valid = true
		// TODO MORE IMPORTANTER: think about this and probably rewrite
		this.raw = JSON.parse(json)
		// TODO: parse boards and lists
		this.data = {
			boards: [],
		}

		for (const rawBoard of this.raw.boards) {
			this.data.boards.push(new Board(rawBoard))
		}
	}

	/**
		* @param {Board} boardObj - a `Board` that will be added to this `Data` instance
		* @returns {0 | 1} exitCode - execution exit status
		* 0 - successfuly added the board to this instance of `Data`
		* 1 - parameter `boardObj` is not an instance of `Board` class
	*/
	addBoard(boardObj) {
		if (!(boardObj instanceof Board)) {
			return 1
		}

		this.data.boards.push(boardObj)
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
		return data
	}

	/**
		* @param {String} [userName] - user name of the user to write data file to, if empty then it will try to use `this.user`
	*/
	writeFile(userName) {
		
	}


}



/**
	* @typedef {Object} boardObject an object to be parsed into an instance of `Board`
	* @property {String} boardObject.name name of the board
	* @property {habitObject[]} [boardObject.habits=[]] array of habit-like objects
	* @property {listObject[]} [boardObject.lists=[]] array of list-like objects
	* @see {@link habitObject}
	* @see {@link listObject}
	*
*/
class Board {
	/**
		* @param {boardObject} boardObject - object to be parsed into `Board` - `{name, habits, lists}`
		* @returns {Board} instance of `Board`, possibly invalid, see `Board.valid`
	*/
	constructor({name, habits = [], lists = []}) {
		/** @type {Boolean} whether the instance valid */
		this.valid = false

		/** @type {Number} validation state (0 is valid) */
		this.validation = validateBoard({name, habits, lists})
		if (this.validation !== 0) {
			return this
		}
		this.valid = true

		/** @type {String} name of the board */
		this.name = name
		/** @type {Habit[]} array of `Habit` */
		this.habits = habits.map(Habit)
		/** @type {List[]} array of `List` */
		this.lists = lists.map(List)
	}

	/** @returns {boardObject} */
	toObject() {
		return {
			name: this.name,
			habits: this.habits.map(h => h.toObject()),
			lists: this.lists.map(l => l.toObject())
		}
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

