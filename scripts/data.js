import { profile, verifyToken, verifyPermission } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"

export async function handleDataGet(req, _info, params) {
	const token = getCookies(req.headers).token;
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token);
	const name = params.pathname.groups.name
	if (tokenOwner != name || verifyPermission(name, tokenOwner, 2)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 401})
	}
	const data = await getDataFile(name, token)
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}

async function getDataFile(name, token) {
	const tokenOwner = verifyToken(token)
	if (name != tokenOwner) {
		return null
	}
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
	}

	const decrypted = await decrypt(file, iv, key)
	return decrypted
}


export async function handleDataSet(req, _info, params) {
	const token = getCookies(req.headers).token;
	if (!token) {
		return new Response('not found: token', {status: 401})
	}
	const tokenOwner = verifyToken(token);
	const name = params.pathname.groups.name
	if (tokenOwner != name || verifyPermission(name, tokenOwner, 1)) {
		return new Response(`not found: permission for ${tokenOwner}`, {status: 401})
	}
	const data = await getDataFile(name, token)
	return new Response(`Hi ${tokenOwner}, you have a cookie!\nHere's your data:\n${data}`, {status: 200})
}


async function setDataFile(name, token, string) {
	const tokenOwner = verifyToken(token)
	if (name != tokenOwner) {
		return null
	}
	const hash = profile(name).password
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	const encrypted = await encrypt(string, iv, key)


	Deno.createSync(`data/${name}`)
	Deno.writeTextFileSync(`data/${name}`, encrypted);

}

// console.log(await setDataFile('test', '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9', 'HelloWorld'))
// console.log(await getDataFile('test', '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9'))
