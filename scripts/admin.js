import { users, tokens } from "./database.js";
import { tokenResponse } from "./data.js";
import { serveFile } from "jsr:@std/http/file-server";

export function handleAdmin(req) {
	const res = tokenResponse(req, {adminPermissions: 1})
	if (res[0]) {
		return res[0]
	}

	return serveFile(req, 'dynamic/admin.html')
}

export function handleAdminStats(req) {
	const res = tokenResponse(req, {adminPermissions: 1})
	if (res[0]) {
		return res[0]
	}

	const s = stats()
	return new Response(JSON.stringify(s), {status: 200, headers: {'Content-Type': 'application/json'}})
}

function stats(tokenQueryParams) { // TODO write frontend for tokenQueryParams (validation included :sob:)
	const userData = users()
	const tokenData = tokens(tokenQueryParams)

	const countUsers = userData.length
	const countTokens = tokenData.length
	
	return {userData, tokenData, countUsers, countTokens}
}
