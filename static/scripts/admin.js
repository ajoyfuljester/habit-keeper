import { timeToISO } from "./utils.js"


/**
	* @param {import("../../scripts/admin.js").AdminStatsObject} stats 
*/
function createStatsElement(stats) {
	const elStats = document.createElement("div")

	elStats.classList.add("stats")


	const elUsers = document.createElement("div")
	for (const user of stats.userData) {
		const el = document.createElement("div")

		const elName = document.createElement("span")
		elName.textContent = user.name
		el.appendChild(elName)

		const elAdmin = document.createElement("span")
		elAdmin.textContent = user.adminMode
		el.appendChild(elAdmin)


		elUsers.appendChild(el)
	}

	elStats.appendChild(elUsers)

	const elTokens = document.createElement("div")
	for (const token of stats.tokenData) {
		const el = document.createElement("div")

		const elName = document.createElement("span")
		elName.textContent = token.userName
		el.appendChild(elName)

		const elExpiration = document.createElement("span")
		elExpiration.textContent = timeToISO(new Date(token.expirationDate))
		el.appendChild(elExpiration)


		elTokens.appendChild(el)
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
