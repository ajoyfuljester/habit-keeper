import { user, verifyToken, verifyPermission, verifyAdminPermission } from "./database.js";
import { getCookies } from "jsr:@std/http/cookie"
import { encrypt, decrypt, nameToIV, hashToKey } from "./encryption.js"
import { assert } from "jsr:@std/assert/assert";
import { validateData, validateDataResponse } from "./validation.js";


/**
	* @param {String} name - user name
	* @returns {Promise<String>} decrypted contents of the file or "null" if file does not exist
*/
export async function getDataFile(name) {
	console.log(name)
	const hash = user(name).password
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


/**
	* @param {String} name - user name
	* @param {String} string - decrypted contents to be written to user's data file
	* @returns {void} nothing
*/
export async function setDataFile(name, string) {
	const hash = user(name).password
	const iv = nameToIV(name);
	const key = await hashToKey(hash);

	const encrypted = await encrypt(string, iv, key)


	Deno.createSync(`data/${name}`)
	Deno.writeTextFileSync(`data/${name}`, encrypted);

}


/**
	* @callback RouteAsync gets a Request from a client and replies with an appropriate Response as a Promise
	* @param {Request} req - request from client
	* @param {*} _info - i don't know what this is
	* @param {*} params - i don't know what this is, but it has `pathname.groups` stuff
	* @returns {Promise<Response>} response back to the client as a promise
*/
/**
	* @callback Route gets a Request from a client and replies with an appropriate Response
	* @param {Request} req - request from client
	* @param {*} _info - i don't know what this is
	* @param {*} params - i don't know what this is, but it has `pathname.groups` stuff
	* @returns {Response} response back to the client
*/


/**
	* @type {RouteAsync}
*/
export async function handleDataGet(req, _info, params) {
	const res = tokenResponse(req, {params, permissions: 1})
	if (res[0]) {
		return res[0]
	}

	const name = res[1]

	const data = await getDataFile(name)
	return new Response(data, {status: 200, headers: {'Content-Type': 'application/json'}})
}

/**
	* @type {Route}
*/
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



/**
	* @param {Request} req - request from the client
	* @param {Boolean} force - whether to forcefully overwrite data file with a template
	* @param {*} params - i don't know what this is, but it has `pathname.groups` stuff
	* @returns {Response} response for the client
*/
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



/**
	* @type {Route}
*/
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


/**
	* @param {Request} req - request from the client
	* @returns {String | undefined} token string that is included in the request or `undefined` if it does not exist
*/
function extractToken(req) {
	return getCookies(req.headers).token
}


/**
	* @param {Request} req - request from the client
	* @param {Object} options - optional parameters
	* @param {*?} options.params - params from a request handler ({@link Route}), used if you want to retrieve a name of the user in the url
	* @param {Number?} options.permissions - permission that the owner of the token needs to perform an operation NEEDS `params`, XOR `adminPermissions`
	* @param {Number?} options.adminPermissions - admin permission that the owner of the token needs to perform an operation, XOR `permissions`
	* @returns {[Response, null] | [null, String]} returns an two element array, if the first element is a `Response`, then token is invalid, else the second element is the name of the owner of the token
*/
export function tokenResponse(req, {params, permissions, adminPermissions}) { // TODO: clean up this function
	assert(!!permissions !== !!adminPermissions, 'both permissions and adminPermissions is set, does not make sense')
	if ((permissions || adminPermissions) && !params) {
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
	if (adminPermissions !== undefined && !verifyAdminPermission(tokenOwner, adminPermissions)) {
		return [new Response(`not found: admin permission for ${tokenOwner}`, {status: 403}), null]
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
