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



/** @type {import("./data.js").Route} */
function handlePermissionCreate(req, _info, params) {


}
