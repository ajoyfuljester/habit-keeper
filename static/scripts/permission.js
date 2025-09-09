import * as Utils from "./utils.js";
import * as HTMLUtils from "./HTMLUtils.js";

async function main() {
	const name = Utils.extractName()

	const req = new Request(`/api/permission/${name}`, {
		method: "GET",
	})

	const res = await fetch(req)


	if (!res.ok) {
		return 1
	}

	// TODO: add the correct type here
	/** @type {import("../../scripts/database.js").Permission} */
	const data = await res.json()

	console.log(data)


	const elGet = createPemissionGetElement(data)

	document.querySelector("main").appendChild(elGet)


}


/**
	* @param {{guests: Object.<string, Number>, owners: Object.<string, Number>}} data array of permissions of the GUEST with `name`
	* @returns {HTMLDivElement} element with data tables and other stuff
*/
function createPemissionGetElement(data) {

	const el = document.createElement('div')

	const elTableGuests = document.createElement("table")

	// TODO: search bar
	// table... rows... display none...
	// also a button for deleting? or maybe an input for changing... also maybe a popup for creating/chaning

	for (const [name, accessMode] of Object.entries(data.guests)) {
		const elRow = document.createElement('tr')

		const elName = document.createElement('td')
		elName.textContent = name
		elRow.appendChild(elName)

		const elAccessMode = document.createElement('td')
		elAccessMode.textContent = accessMode
		elRow.appendChild(elAccessMode)


		elTableGuests.appendChild(elRow)

	}


	el.appendChild(elTableGuests)


	// TODO: also a search bar


	const elTableOwners = document.createElement("table")

	for (const [name, accessMode] of Object.entries(data.guests)) {
		const elRow = document.createElement('tr')

		const elName = document.createElement('td')
		elName.textContent = name
		elRow.appendChild(elName)

		const elAccessMode = document.createElement('td')
		elAccessMode.textContent = accessMode
		elRow.appendChild(elAccessMode)


		elTableOwners.appendChild(elRow)

	}

	el.appendChild(elTableOwners)


	return el

}


main()
