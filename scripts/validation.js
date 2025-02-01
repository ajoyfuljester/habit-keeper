export const dataTemplate = {
	habits: [],
	lists: [],
}


/**
	* @param {String} dataString - json string that would be converted to `Data` object
	* @returns {[Number, String]} exit status - `[exitCode, info]`, used to give user feedback about the `Request` body
	* `[0, null]` - `dataString` is valid, no errors
	* `[1, message]` - `JSON.parse` failed because of `SyntaxError`, `message` is the message of the error
	* `[2, null]` - parsed `dataString` is not of type `object`
	* `[3, key]` - parsed `dataString` has an unknown key with the name `key`
	*
	* @see {@link dataTemplate}
	* @todo THIS FUNCTION IS SO DEEP IT SHOULD ONLY BE CALLED FOR .../set, BECAUSE SERVER OPERATIONS "CANNOT" BE WRONG, BUT RIGHT NOW I'M TOO LAZY TO WRITE A MORE SHALLOW ONE
*/
export function validateData(dataString) {
	try {
		JSON.parse(dataString)
	} catch (error) {
		if (error instanceof SyntaxError) {
			return [1, error.message] // maybe i should start doing what i saw was going on in `go`, something like return [value, error], well, maybe in the next project
		} // well now it will be [errorCode, aditionalInfo]
		throw error
	} // idk how to write this properly, i don't really want to use `let`
	const data = JSON.parse(dataString)
	if (typeof data != 'object') {
		return [2, null]
	}
	const dataKeys = Object.keys(data)
	const templateKeys = Object.keys(dataTemplate)
	for (const key of dataKeys) {
		if (!templateKeys.includes(key)) {
			return [3, key]
		}
	}

	if (dataKeys.includes('boards')) {
		for (const board in data.boards) {
			const info = validateBoard(board)
			if (info !== 0) {
				return [4, JSON.stringify(board)]
			}
		}
	}
	
	return [0, null]
}


/**
	* @param {[status: Number, info: String]} validationStatus - array returned from `validateData`
	* @returns {Response} response based on the validation status of the given dataString
	*
	*
	* @see {@link validateData}
*/
export function validateDataResponse([status, info]) {
	if (status == 0) {
		return new Response('success', {status: 200})
	} else if (status == 1) {
		return new Response(`validation failed: json failed: ${info}`, {status: 400})
	} else if (status == 2) {
		return new Response(`validation failed: schema failed: type of request is not 'object'`, {status: 400})
	} else if (status == 3) {
		return new Response(`validation failed: schema failed: unsupported key '${info}'`, {status: 400})
	} else if (status == 4) {
		return new Response(`validation failed: schema failed: board validation failed at board: '${info}'`, {status: 400})
	}
	return new Response(`not found: reason for this error`, {status: 400})
}


/**
	* @param {String} string - text to validate
	* @param {RegExp} regex - regular expression to match `string` against
	* @returns {0 | 1 | 2 | 3} exitCode of the validation
	* `0` - success, string is valid
	* `1` - `string` is not of type `string`, naming is hard...
	* `2` - `regex` was not matched exactly one time
	* `3` - `regex` match was not the whole `string`
	* these codes are probably useless and also this probably could have been done easier, but i think i had trouble understanding which function to use (`string.match()` or `regex.test()` or maybe something else)
	*
*/
export function validateString(string, regex) {
	if (typeof string !== "string") {
		return 1
	}
	const matches = string.match(regex);
	if (matches.length != 1) {
		return 2
	}
	if (matches[0].length != string.length) {
		return 3
	}

	return 0
}

const nameRegEx = /\w{1,64}/g


/**
	* @param {String} name - a name, maybe a user maybe a board
	* @returns {Number} exitCode, `0` is success
	*
	* @see {@link validateString}
*/
export function validateName(name) {
	return validateString(name, nameRegEx)
}

const passwordRegEx = /.{1,128}/g

/**
	* @param {String} password - a password, probably from the user
	* @returns {Number} exitCode, `0` is success
	*
	* @see {@link validateString}
*/
export function validatePassword(password) {
	return validateString(password, passwordRegEx)
}

const ISODateRegEx = /\d{4}-\d{2}-\d{2}/g
/**
	* @param {String} date - a date string
	* @returns {Number} exitCode, `0` is success, `YYYY-MM-DD`
	*
	* @see {@link validateString}
*/
export function validateISODate(date) {
	return validateString(date, ISODateRegEx)
}


export function validateBoard({name, habits, lists}) {
	if (validateName(name) !== 0) {
		return 1
	}

	for (const habit of habits) {
		if (validateHabit(habit) !== 0) {
			return 2
		}
	}

	for (const list of lists) {
		if (validateList(list) !== 0) {
			return 3
		}
	}

	return 0
}



/**
	* @param {Array} offset - an array to check if it can be converted to an `Offset`
	* @returns {Number} exitCode
	* `0` - success
	* `1` - `offset` is not an array
	* `2` - `offset` length is not `2`
	* `3` - first element of `offset` is not of type `number`
	* `4` - second element of `offset` is not of type `number`
	* `5` - first element of `offset` is negative
	* `6` - first element of `offset` is not an integer
*/
export function validateOffset(offset) {
	if (!Array.isArray(offset)) {
		return 1
	}

	if (offset.length !== 2) {
		return 2
	}

	if (typeof offset[0] !== "number") {
		return 3
	}

	if (typeof offset[1] !== "number") {
		return 4
	}

	if (offset[0] < 0) {
		return 5
	}

	if (!offset[0].isInteger()) {
		return 6
	}

	return 0
}


/**
	* @param {import("./action.js").habitObject} habitObject - `{name, startingDate, offsets}`
	* @returns {0 | 1 | 2 | 3 | 4} exitCode
	* `0` - success, valid
	* `1` - `name` not valid
	* `2` - `startingDate` not valid
	* `3` - `offsets` is not an array
	* `4` - `offsets` contains an invalid offset
	*
	* @see {@link validateOffset}
	* @see file `./actions.js`
*/
export function validateHabit({name, startingDate, offsets}) {
	if (validateName(name) !== 0) {
		return 1
	}
	
	if (validateISODate(startingDate) !== 0) {
		return 2
	}

	if (!Array.isArray(offsets)) {
		return 3
	}


	for (const offset of offsets) {
		if (validateOffset(offset) !== 0) {
			return 4
		}
	}

	return 0

}


/**
	* @param {Array} offsets - array of offsets that will be filtered if invalid
	* @returns {[Number, Number][]} filteredOffsets array of offsets that passed validation
*/
function filterOffsets(offsets) {
	const filtered = []
	for (const offset of offsets) {
		if (validateOffset(offset) !== 0) {
			continue
		}
		filtered.push(offset)
	} 
	return filtered
}


/**
	* @param {Number} exitCode - an exit code attained from `validateString`
	* @returns {Response} response based on `exitCode`
*/
export function validateStringResponse(exitCode) {
	if (exitCode === 0) {
		return new Response('success', {status: 200})
	} else if (exitCode === 1) {
		return new Response('failure: type of value is not string', {status: 400})
	} else if (exitCode === 2 || exitCode === 3) {
		return new Response('failure: regex', {status: 400})
	}
	console.error(exitCode)
	console.trace()
	return new Response('failure: unknown error', {status: 500})
}
