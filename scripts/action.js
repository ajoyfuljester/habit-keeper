import { tokenResponse, dataTemplate, validateData, getDataFile } from "./data.js";
import { dateToISO } from "./utils.js";
import { assert } from "jsr:@std/assert/assert";

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
			}
		}
	} else {
		res = new Response("unhandled error", {status: 500})
		console.error(body)
		console.trace()
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
		this.data.boards.push(boardObj)
	}

	jsonAddBoard(json) {
		// TODO: validate this board... so much validation :sob:
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
		console.log(name)
		assert(typeof name === "string", "typeof name is not string")
		assert(typeof startingDate === "string", "typeof startingDate is not string")
		assert(Array.isArray(offsets), "typeof offsets is not array")
		this.name = name
		this.startingDate = startingDate ?? dateToISO()
		this.offsets = offsets ?? []
	
	}
}