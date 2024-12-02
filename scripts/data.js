import { profile, verifyToken, verifyPermission } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"

export async function handleDataGet(req, _info, params) {
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token);
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
		return "null"
	}

	const decrypted = await decrypt(file, iv, key)
	return decrypted
}


export async function handleDataSet(req, _info, params) { // TODO: write this
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token);
	const name = params.pathname.groups.name
	if (tokenOwner !== name || verifyPermission(name, tokenOwner, 1)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 403})
	}
	const data = await getDataFile(name, token)
	return new Response(`Hi ${tokenOwner}, you have a cookie!\nHere's your data:\n${data}`, {status: 200})
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
	if (tokenOwner !== name || verifyPermission(name, tokenOwner, 4)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 403})
	}

	setDataFile(name, JSON.stringify(dataTemplate))
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

export async function handleDefaultSet(req) { // TODO: write this
	const token = extractToken(req);
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const name = verifyToken(token);
	if (!name) {
		return new Response(`not found: user associated with token`, {status: 401})
	}

	const data = await getDataFile(name, token);
	
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}

export function handleDefaultInit(req) {
	const token = extractToken(req)
	if (!token) {
		return new Response('not found: token', {status: 401})
	}

	const name = verifyToken(token);
	if (!name) {
		return new Response(`not found: user associated with token`, {status: 401})
	}

	setDataFile(name, JSON.stringify(dataTemplate))
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

const dataTemplate = {
	boards: [],
	lists: [],
}
