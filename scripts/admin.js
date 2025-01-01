import { users, tokens } from "./database.js";
import { tokenResponse } from "./data.js";

export function handleAdmin(req) {
	let res = tokenResponse(req)

}

function stats(tokenQueryParams) {
	const userData = users()
	const tokenData = tokens()

	const countUsers = userData.length
	const countTokens = tokenData.length
	
	return {userData, tokenData, countUsers, countTokens}
}
