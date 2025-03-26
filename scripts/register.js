import * as db from "./database.js";


/**
	* @param {Request} req - request from the client
	* @returns {Response} response with json with error code, if successful then code is 0
*/
export async function handleRegister(req) {
	const data = await req.json()
	const registerResult = await db.addUser(data.name, data.password)

	const res = {
		code: registerResult,
	}

	if (registerResult !== 0) {
		return new Response(JSON.stringify(res), { status: 400, headers: {'Content-Type': 'application/json'} });
	}

	return new Response(JSON.stringify(res), { status: 200, headers: {
		'Content-Type': 'application/json',
	}});
}

