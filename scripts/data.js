import { profile, verifyToken } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"

function data(name) {
	return profile(name)
}

export function handleData(req) {
	const token = getCookies(req.headers).token;
	if (!token) {
	return new Response('Hi not logged in, if you are someone, you have a cookie!', {status: 200})
	}
	const name = verifyToken(token);
	console.log(name)
	return new Response('Hi ' + (name ?? '**NO ONE**') + ', if you are someone, you have a cookie!', {status: 200})
}

async function getDataFile(name, hash) {
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


async function setDataFile(name, hash, string) {
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	const encrypted = await encrypt(string, iv, key)


	Deno.createSync(`data/${name}`)
	Deno.writeTextFileSync(`data/${name}`, encrypted);

}

// console.log(await setDataFile('test', '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9', 'HelloWorld'))
// console.log(await getDataFile('test', '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9'))
