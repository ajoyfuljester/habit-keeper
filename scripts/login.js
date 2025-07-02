import * as db from "./database.js";
import { CONFIG } from "../main.js"
import { extractToken } from "./data.js";


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

/**
	* @returns {Response}
*/
export async function handleDefaultLogin() {
	const credentials = CONFIG.defaultAccount
	if (!credentials) {
		return new Response("default account is not set", {status: 500})
	}

	const loginResult = await db.login(credentials.name, credentials.password)
	if (loginResult !== 0) {
		return new Response(`default account login failed, code: ${loginResult}`)
	}

	const token = db.createToken(credentials.name);

	return new Response("success", { status: 200, headers: {
		'Set-Cookie': `token=${token.token}; Max-Age=${token.maxAge}; SameSite=Strict; Secure; Path=/; HttpOnly`,
	}});
}


/**
	* @param {Request} req request from the client
	* @returns {Response} response
	* 200 - logged out
	* 401 - no token
	* 500 - something went horribly wrong
*/
export function handleLogout(req) {
	const token = extractToken(req)
	if (!token) {
		return new Response('not found: token', { status: 401 })
	}

	const result = db.logout(token)
	if (result !== 0) {
		return new Response('error: something went very wrong during logging out', { status: 500 })
	}

	return new Response('success', { status: 200, headers: {
		'Set-Cookie': `token=; Max-Age=0; SameSite=Strict; Secure; Path=/; HttpOnly`,
	}});
}


/**
	* @param {Request} req request from the client
	* @returns {Response} response with status
	* 200 - logged out
	* 401 - no token
	* 403 - no user for the token
	* 500 - something went horribly wrong
*/
export function handleLogoutAll(req) {
	const token = extractToken(req)
	if (!token) {
		return new Response('not found: token', { status: 401 })
	}

	const user = db.verifyToken(token)
	if (!user) {
		return new Response("not found: user associated with token", { status: 403 })
	}

	const result = db.logoutAll(user)
	if (result !== 0) {
		return new Response('error: something went very wrong during logging out', { status: 500 })
	}

	return new Response('success', { status: 200, headers: {
		'Set-Cookie': `token=; Max-Age=0; SameSite=Strict; Secure; Path=/; HttpOnly`,
	}});
}
