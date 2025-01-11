import { tokenResponse, dataTemplate, validateData, getDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { validateHabit, validateStringResponse } from "./validation.js";




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
			const exitCode = Action.boards.create(name, body.what)
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
	* @returns {Number} exitCode - execution exit code
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
		* @param {String} json - raw json string to validate and parse into a `Data` instance
		* @todo i don't know how to properly document every property
		* @todo also what exactly to do with `@returns` here
	*/
	constructor(json) {
		this.valid = true
		const validationResult = validateData(json)
		if (validationResult[0] !== 0) {
			this.valid = false;
			return
		}
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
	*/
	static async fromFile(userName) {
		const json = await getDataFile(userName)
		return new Data(json)
	}


}


/**
	* @typedef {Object} habitObj - an object to be parsed into an instance of `Habit`
	* @property {String} habitObj.name - name of the habit
	* @property {String} [habitObj.startingDate=dateToISO()] - date from which the habit
	* @property {Offset[]} [habitObj.offsets=[]] - array of Offsets (offset, value pairs) defaults to empty array
*/
class Habit {
	/**
		* @param {habitObj} habitObj - `{name, startingDate, offsets}`
		* @see {@link habitObj}
	*/
	constructor({name, startingDate = dateToISO(), offsets = []}) {
		this.valid = true
		if (validateHabit({name, startingDate, offsets}) !== 0) {
			this.valid = false
			return
		}
		this.name = name
		this.startingDate = startingDate
		this.offsets = offsets
	
	}
}


class Offset {
	/**
		* @param {Object} offsetObj - an object to be parsed into an instance of `Offset`
		* @param {Number} offsetObj.offset - offset from `startingDate` (see {@link Habit})
		* @param {Number} offsetObj.value - value of the day
	*/
	constructor({offset, value}) {
		this.offset = offset;
		this._value = value;
	}

	
	/**
		* @param {Number} x - number to be set as `value`
	*/
	set value(x) {
		this._value = x;
	}
	
	/**
		* @returns {Number} value - value of this `Offset`
	*/
	get value() {
		return this._value;
	}

	/**
		* @param {Number} [n=1] - number to increment `value` by, can be negative, can be a fraction too, and Infinity too i suppose, hmmmm
		* @returns {Number} new `value`
	*/
	changeValue(n = 1) {
		this._value += n;
		return this._value
	}

}
