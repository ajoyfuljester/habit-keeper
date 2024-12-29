import { tokenResponse, dataTemplate, validateData, getDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { validateBoard, validateStringResponse } from "./validation.js";

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

const Action = {
	boards: {},
}

Action.boards.create = async (profileName, rawBoard) => {
	const data = await Data.fromFile(profileName)
	console.log(data)
	console.log(rawBoard)
	const exitCode = data.addBoard(new Board(rawBoard))
	// TODO: handle exit codes...
	
	return exitCode
}

class Data {
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

	addBoard(boardObj) {
		if (!(boardObj instanceof Board)) {
			return 1
		}

		this.data.boards.push(boardObj)
		return 0
	}

	jsonAddBoard(json) {
		const obj = JSON.parse(json)
		this.data.boards.push(new Board(obj))
		return 0
	}
	static async fromFile(profileName) {
		const json = await getDataFile(profileName)
		return new Data(json)
	}


}

class Board {
	constructor({name, startingDate, offsets}) {
		this.valid = true
		if (validateBoard({name, startingDate, offsets}) !== 0) {
			this.valid = false
			return
		}
		this.name = name
		this.startingDate = startingDate ?? dateToISO()
		this.offsets = offsets ?? []
	
	}
}
