import * as db from "./database.js";


/**
	* @param {Request} req - request from the client
	* @returns {Response} response with json with error code, if successful then code is 0 and response sets `token` cookie
*/
export async function handleLogin(req) {
	const data = await req.json()
	const loginResponse = await db.login(data.name, data.password)

	const res = {
		code: loginResponse,
	}

	if (loginResponse != 0) {
		return new Response(JSON.stringify(res), { status: 401, headers: {'Content-Type': 'application/json'} });
	}

	const token = db.createToken(data.name);

	return new Response(JSON.stringify(res), { status: 200, headers: {
		'Content-Type': 'application/json',
		'Set-Cookie': `token=${token.token}; Max-Age=${token.maxAge}; SameSite=Strict; Secure; Path=/; HttpOnly`,
	}});
}

