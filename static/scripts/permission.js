import * as Utils from "./utils.js";

async function main() {
	const name = Utils.extractName()

	const req = new Request(`/api/permission/${name}`, {
		method: "GET",
	})

	const res = await fetch(req)


	if (!res.ok) {
		return 1
	}

	/** @type {{guests: Object.<string, Number>, owners: Object.<string, Number>}} */
	const data = await res.json()

	console.log(data)


	const elGet = createPemissionGetElement(data)

	document.querySelector("main").appendChild(elGet)


}


/**
	* @param {{guests: Object.<string, Number>, owners: Object.<string, Number>}} data object with objects with permissions, where the name is a key and permission access mode is the value
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



	const elOwners = document.createElement("div")

	// TODO: also a search bar

	const elOwnersSearchByName = document.createElement("input")
	elOwnersSearchByName.type = "text"
	elOwnersSearchByName.placeholder = "Search owners by name"

	elOwnersSearchByName.addEventListener("input", event => {
		const el = event.target

		const ownersArray = Object.entries(data.owners).map(a => {
			return {name: a[0], accessMode: a[1]}
		})



	})

	// TODO: option to filter by access mode, could be more advanced for bit by bit

	elOwners.appendChild(createTableOwners(data.owners))




	el.appendChild(elOwners)


	return el

}




/**
	* @param {Object.<string, Number>} owners object of permission owners
	* @returns {HTMLTableElement} html table element with 2 columns - name of the owner of permission and access mode
*/
function createTableOwners(owners) {
	const elTableOwners = document.createElement("table")

	for (const [name, accessMode] of Object.entries(owners)) {
		const elRow = document.createElement('tr')

		const elName = document.createElement('td')
		elName.textContent = name
		elRow.appendChild(elName)

		const elAccessMode = document.createElement('td')
		elAccessMode.textContent = accessMode
		elRow.appendChild(elAccessMode)


		elTableOwners.appendChild(elRow)

	}

	return elTableOwners

}


main()
