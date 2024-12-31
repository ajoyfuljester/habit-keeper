import { profiles, tokens } from "./database.js";

function stats(tokenQueryParams) {
	const profileData = profiles()
	const tokenData = tokens()

	const countProfiles = profileData.length
	const countTokens = tokenData.length
	
	return {profileData, tokenData, countProfiles, countTokens}
}
