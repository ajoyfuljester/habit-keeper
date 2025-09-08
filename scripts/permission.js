import { tokenResponse } from "./data.js";
import * as db from "./database.js";

/** @type {import("./data.js").Route} */
export function handlePermission(req, _info, params) {

	if (req.method === "GET") {
		return handlePermissionGet(req, _info, params)
	} else if (req.method === "POST") {
		return handlePermissionCreate(req, _info, params)
	}



}



/** @type {import("./data.js").Route} */
function handlePermissionGet(req, _info, params) {
	const [res, name] = tokenResponse(req, {params, permissions: 4})
	if (res) {
		return res
	}

	const permissionObject = db.getPermissionsAll(name)


	return new Response(JSON.stringify(permissionObject), { status: 200, headers: {'Content-Type': 'application/json'} });
	

}



/** @type {import("./data.js").RouteAsync} */
async function handlePermissionCreate(req, _info, params) {
	const [res, owner] = tokenResponse(req, {params, permissions: 4})
	if (res) {
		return res
	}


	let data
	try {
		data = await req.json()
	} catch (error) {
		if (error instanceof SyntaxError) {
			return new Response(`validation failed: json failed: ${error.message}`, {status: 400})
		}

		throw error
	}


	

	const validation = validationResponse(data)

	if (!validation) {
		return validation
	}



	// NOTE: i feel like this might throw an error if the guest user does not exist
	// TODO: test this
	db.setPermission(owner, data.guest, data.accessMode)


	return new Response("success", {status: 201})

}




/**
	* @param {any} data PARSED json from the request
	* @returns {0 | 1 | 2 | 3} errorCode, where
	* `0` - success
	* `1` - `data` is not of type object
	* `2` - `data.guest` is undefined
	* `3` - `data.accessMode` is undefined
*/
function validatePemissionRequest(data) {
	if (typeof(data) !== "object") {
		return 1
	}

	if (typeof(data.guest) !== "string") {
		return 2
	}

	if (typeof(data.accessMode) !== "number") {
		return 3
	}

	return 0

}


/**
	* @returns {Response | null}
*/
function validationResponse(data) {
	const errorCode = validatePemissionRequest(data)

	switch (errorCode) {
		case 0:
			return null
		case 1:
			return new Response(`validation failed: json failed: ${info}`, {status: 400})
		case 2:
			return new Response(`validation failed: schema failed: "guest" property missing or not type string`, {status: 400})
		case 3:
			return new Response(`validation failed: json failed: "accessMode" property missing or not type number`, {status: 400})
		default:
			return new Response(`error: something went horribly wrong`, {status: 500})

	}

	
}
