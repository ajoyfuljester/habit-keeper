import { tokenResponse, dataTemplate, validateData, getDataFile } from "./data.js";
import { dateToISO } from "./utils.js";

export function handleDataAction(req, _info, params) {
	let res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]

	// TODO: validate this thing

	
	const body = req.json()

	if (body.action === "create") {
		if (body.what === "board") { // the second `what` shall be `toWhat`
			Action.boards.create(name, body.data)
		}
	}
}

const Action = {
	boards: {},
}

Action.boards.create = async (profileName, rawBoard) => {
	const data = await Data.fromFile(profileName)
	const exitCode = data.jsonAddBoard(rawBoard)
	// TODO: handle exit codes...
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

	addBoard(obj) {
		this.data.boards.push(new Board(obj))
	}

	jsonAddBoard(json) {
		// TODO: validate this board... so much validation :sob:
		const obj = JSON.parse(json)
		this.data.boards.push(new Board(obj))
	}
	static async fromFile(profileName) {
		const json = await getDataFile(profileName)
		return new Data(json)
	}


}

class Board {
	constructor({name, startingDate, offsets}) {
		this.name = name
		this.startingDate = startingDate ?? dateToISO()
		this.offsets = offsets
	
	}
}
