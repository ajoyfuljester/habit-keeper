export const dataTemplate = {
	boards: [],
	lists: [],
}

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

	// TODO: check nested things
	
	return [0, null]
}

export function validateDataResponse([status, info]) {
	if (status == 0) {
		return new Response('success', {status: 200})
	} else if (status == 1) {
		return new Response(`validation failed: json failed: ${info}`, {status: 400})
	} else if (status == 2) {
		return new Response(`validation failed: schema failed: type of request is not 'object'`, {status: 400})
	} else if (status == 3) {
		return new Response(`validation failed: schema failed: unsupported key '${info}'`, {status: 400})
	}
	return new Response(`not found: reason for this error`, {status: 400})
}

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

export function validateName(name) {
	return validateString(name, nameRegEx)
}

const passwordRegEx = /.{1,128}/g

export function validatePassword(password) {
	return validateString(password, passwordRegEx)
}

const ISODateRegEx = /\d{4}-\d{2}-\d{2}/g
export function validateISODate(date) {
	return validateString(date, ISODateRegEx)
}

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

	if (offset[0] < 1) {
		return 5
	}

	if (!offset[0].isInteger()) {
		return 6
	}

	return 0
}

export function validateBoard({name, startingDate, offsets}) {
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

function filterOffsets(offsets) {
	const filtered = []
	for (const offset of offsets) {
		if (validateOffset(offset) !== 0) {
			continue
		}
		filtered.push(offset)
	} 
}

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
