import { users, tokens } from "./database.js";
import { tokenResponse } from "./data.js";
import { serveFile } from "jsr:@std/http/file-server";


/**
	* @param {Request} req - request from the client
	* @returns {Promise<Response>} response (admin panel site) or `tokenResponse` if authorization fails
*/
export function handleAdmin(req) {
	const res = tokenResponse(req, {adminPermissions: 1})
	if (res[0]) {
		return res[0]
	}

	return serveFile(req, 'dynamic/admin.html')
}


/**
	* @param {Request} req - request from the client
	* @returns {Response} response with stats as json or `tokenResponse` if authorization fails
*/
export function handleAdminStats(req) {
	const res = tokenResponse(req, {adminPermissions: 1})
	if (res[0]) {
		return res[0]
	}

	const s = stats()
	return new Response(JSON.stringify(s), {status: 200, headers: {'Content-Type': 'application/json'}})
}


/**
	* @typedef {Object} AdminStatsObject
	* @property {import("./database.js").User[]} StatsObject.userData array of user information
	* @property {import("./database.js").Token[]} StatsObject.tokenData array of token information
	* @property {number} StatsObject.countUsers number of users in database
	* @property {number} StatsObject.countTokens number of tokens narrowed with the `tokenQueryParams`
	*
	* @param {import("./database.js").TokenOptions} tokenQueryParams 
	* @returns {AdminStatsObject} object with statistics
	*
	* @see {@link AdminStatsObject}
*/
function stats(tokenQueryParams = {}) { // TODO write frontend for tokenQueryParams (validation included :sob:)
	const userData = users()
	const tokenData = tokens(tokenQueryParams)

	const countUsers = userData.length
	const countTokens = tokenData.length
	
	return {userData, tokenData, countUsers, countTokens}
}
