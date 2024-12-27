import { profile, verifyToken, verifyPermission } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"
import { assert } from "jsr:@std/assert/assert";
import { validateData, validateDataResponse } from "./validation.js";

export async function getDataFile(name) {
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
		return "null"
		// i am pretty sure i forgot about something
	}

	const decrypted = await decrypt(file, iv, key)
	return decrypted
}

export async function setDataFile(name, string) {
	const hash = profile(name).password
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	const encrypted = await encrypt(string, iv, key)


	Deno.createSync(`data/${name}`)
	Deno.writeTextFileSync(`data/${name}`, encrypted);

}

export async function handleDataGet(req, _info, params) {
	const res = tokenResponse(req, {params, permissions: 1})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]

	const data = await getDataFile(name)
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}


export function handleDataSet(req, _info, params) { // TODO: write this
	const res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}
	
	const name = res[1]
	const data = req.text()
	
	const validationResult = validateData(data)
	if (validationResult[0] !== 0) {
		return validateDataResponse(validationResult)
	}

	setDataFile(name, data)
	return new Response(`success`, {status: 200})
}


export function handleDataInit(req, force, params) {
	const res = tokenResponse(req, {params, permissions: 2})
	if (res[0]) {
		return res[0]
	}
	const name = res[1]

	if (!force && getDataFile(name) !== "null") { // i am getting dizzy with these conditions today
		return new Response(`not found: force to overwrite existing file, use /api/.../init/force`, {status: 403})
	}
	setDataFile(name, JSON.stringify(dataTemplate))
	return new Response('success', {status: 201})
}


export function handleWho(req) {
	const token = extractToken(req);

	if (!token) {
		return new Response("null", {status: 401, headers: {'Content-Type': 'application/json'}});
	}

	const name = verifyToken(token)
	if (!name) {
		return new Response("null", {status: 401, headers: {'Content-Type': 'application/json'}});
	}

	return new Response(JSON.stringify({ name }), {status: 200, headers: {'Content-Type': 'application/json'}});
}

function extractToken(req) {
	return getCookies(req.headers).token
}

export function tokenResponse(req, {params, permissions}) {
	if (permissions && !params) {
		console.warn('permissions provided, but no params')
		console.trace()
	}
	const token = extractToken(req);
	if (!token) {
		return [new Response('not found: token', {status: 401}), null]
	}
	const tokenOwner = verifyToken(token);
	if (!tokenOwner) {
		return new Response("not found: user associated with token", {status: 403})
	}
	if (!params) {
		return [null, tokenOwner]
	}
	assert(!!permissions, 'params provided, but no permissions')
	const name = params.pathname.groups.name
	if (tokenOwner !== name && verifyPermission(name, tokenOwner, permissions)) {
		return [new Response(`not found: permission for ${tokenOwner}`, {status: 403}), null]
	}
	return [null, name]
}
