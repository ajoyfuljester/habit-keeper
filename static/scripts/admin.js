import * as Utils from "./utils.js"
import * as HTMLUtils from "./HTMLUtils.js"


/**
	* @param {import("../../scripts/admin.js").AdminStatsObject} stats 
*/
function createStatsElement(stats) {
	const elStats = document.createElement("div")

	elStats.classList.add("stats")


	const elUsers = document.createElement("table")
	elUsers.appendChild(HTMLUtils.createRowHeader(
		"name",
		"adminMode",
	))
	for (const user of stats.userData) {
		elUsers.appendChild(HTMLUtils.createRow(
			user.name,
			user.adminMode,
		))
	}

	elStats.appendChild(elUsers)

	const elTokens = document.createElement("table")
	elTokens.appendChild(HTMLUtils.createRowHeader(
		"name",
		"expiration time",
	))
	for (const token of stats.tokenData) {
		elTokens.appendChild(HTMLUtils.createRow(
			token.userName,
			Utils.datetimeToISO(new Date(token.expirationDate)),
		))
	}

	elStats.appendChild(elTokens)









	return elStats

}


async function main() {
	const res = await fetch("/api/admin/stats")


	if (!res.ok) {
		return 1
	}

	/** @type {import("../../scripts/admin.js").AdminStatsObject} */
	const data = await res.json()

	console.log(data)


	const elStats = createStatsElement(data)


	const elParent = document.querySelector("main")

	elParent.appendChild(elStats)

}


main()
