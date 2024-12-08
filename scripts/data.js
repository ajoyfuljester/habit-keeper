import { profile, verifyToken, verifyPermission } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"

export async function handleDataGet(req, _info, params) {
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token); // TODO: probably get this thing to a function too
	const name = params.pathname.groups.name
	if (tokenOwner !== name || verifyPermission(name, tokenOwner, 2)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 403})
	}
	const data = await getDataFile(name, token)
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}

async function getDataFile(name) {
	const hash = profile(name).password
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	let file;
	try {
		file = Deno.readTextFileSync(`data/${name}`);
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error
		}
		return null
		// i am pretty sure i forgot about something
	}

	const decrypted = await decrypt(file, iv, key)
	return decrypted
}


export function handleDataSet(req, _info, params) { // TODO: write this
	const token = extractToken(req); // TODO: extract these 4 lines into a function
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token);
	const name = params.pathname.groups.name
	if (tokenOwner !== name || verifyPermission(name, tokenOwner, 2)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 403})
	}
	
	const data = req.text()
	
	const validationResult = validateData(data)
	if (validationResult[0] !== 0) {
		return validateDataResponse(validationResult)
	}

	setDataFile(name, data)
	return new Response(`success`, {status: 200})
}


async function setDataFile(name, string) {
	const hash = profile(name).password
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	const encrypted = await encrypt(string, iv, key)


	Deno.createSync(`data/${name}`)
	Deno.writeTextFileSync(`data/${name}`, encrypted);

}

export function handleDataInit(req) {
	const token = extractToken(req)
	if (!token) {
		return new Response('not found: token', {status: 401})
	}

	const tokenOwner = verifyToken(token);
	const name = params.pathname.groups.name
	if (tokenOwner !== name || verifyPermission(name, tokenOwner, 2)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 403})
	}

	if (!(force || getDataFile(name) !== null)) {
		return new Response(`not found: force to overwrite existing file`, {status: 403})
	}
	setDataFile(name, JSON.stringify(dataTemplate))
	return new Response('success', {status: 201})
}

export async function handleDefaultGet(req) {
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const name = verifyToken(token);

	const data = await getDataFile(name, token);
	
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}

export function handleDefaultSet(req) { // TODO: write this
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const name = verifyToken(token);
	if (!name) {
		return new Response(`not found: user associated with token`, {status: 401})
	}

	const data = req.text()
	const validationResult = validateData(data)
	if (validationResult[0] !== 0) {
		return validateDataResponse(validationResult)
	}

	setDataFile(name, data)
	return new Response('success', {status: 201})
}

export function handleDefaultInit(req, force = false) {
	const token = extractToken(req)
	if (!token) {
		return new Response('not found: token', {status: 401})
	}

	const name = verifyToken(token);
	if (!name) {
		return new Response(`not found: user associated with token`, {status: 401})
	}

	if (!(force || getDataFile(name) !== null)) {
		return new Response(`not found: force to overwrite existing file`, {status: 403})
	}
	setDataFile(name, JSON.stringify(dataTemplate))
	return new Response('success', {status: 201})
}

export function handleWho(req) {
	const token = extractToken(req);

	if (!token) {
		return new Response(null, {status: 401, headers: {'Content-Type': 'application/json'}});
	}

	const name = verifyToken(token)
	if (!name) {
		return new Response(null, {status: 401, headers: {'Content-Type': 'application/json'}});
	}

	return new Response(JSON.stringify({ name }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

function extractToken(req) {
	return getCookies(req.headers).token
}

const dataTemplate = {
	boards: [],
	lists: [],
}

function validateData(dataString) {
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
	for (key of dataKeys) {
		if (!templateKeys.includes(key)) {
			return [3, key]
		}
	}

	// TODO: check nested things
	
	return [0, null]
}

function validateDataResponse([status, info]) {
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
