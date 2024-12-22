import { tokenResponse, dataTemplate, validateData } from "./data.js";

export function handleDataAction(req, _info, params) {
	const res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]
}

const Action = {
	boards: {},
}

Action.boards.create = (profileName, boardName) => {
	
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
	}


}

class Board {
	constructor(raw) {

	}
}
