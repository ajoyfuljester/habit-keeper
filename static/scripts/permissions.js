import * as Utils from "./utils.js";
import "./fuse.js";

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

	const elGuests = document.createElement("div")


	// TODO: search bar
	// table... rows... display none...
	// also a button for deleting? or maybe an input for changing... also maybe a popup for creating/chaning

	const elGuestsSearchByName = document.createElement("input")
	elGuestsSearchByName.type = "text"
	elGuestsSearchByName.placeholder = "Search guests by name"

	elGuests.appendChild(elGuestsSearchByName)

	const elGuestsCreator = createGuestsCreator()
	elGuests.appendChild(elGuestsCreator)

	elGuests.appendChild(createGuestsTable(data.guests))

	el.appendChild(elGuests)



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

		// TODO: create a type for options maybe
		const options = {
			keys: ['name'],
		}

		// const fuse = new Fuse(ownersArray, options)
		//
		// const result = fuse.search(el.value)
		//
		// console.log(result)




	})

	elOwners.appendChild(elOwnersSearchByName)

	// TODO: option to filter by access mode, could be more advanced for bit by bit

	elOwners.appendChild(createOwnersTable(data.owners))




	el.appendChild(elOwners)


	return el

}




/**
	* @param {Object.<string, Number>} owners object of permission owners
	* @returns {HTMLTableElement} html table element with 2 columns - name of the owner of permission and access mode
*/
function createOwnersTable(owners) {
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

/**
	* @param {Object.<string, Number>} guests object of permission guests
	* @returns {HTMLTableElement} html table element with 2 columns - name of the guest of permission and access mode
*/
function createGuestsTable(guests) {
	const elTable = document.createElement("table")

	for (const [name, accessMode] of Object.entries(guests)) {
		const elRow = document.createElement('tr')

		const elName = document.createElement('td')
		elName.textContent = name
		elRow.appendChild(elName)

		const elAccessMode = document.createElement('td')
		elAccessMode.textContent = accessMode
		elRow.appendChild(elAccessMode)


		elTable.appendChild(elRow)

	}

	return elTable

}


/**
	* @returns {HTMLFormElement} form element with inputs for creating a permission for someone
*/
function createGuestsCreator() {

	const elForm = document.createElement("form")
	
	const elName = document.createElement("input")
	elName.type = "text"
	elName.placeholder = "Guest name"
	elForm.appendChild(elName)
	
	// TODO: add a creator for for choosing individually permission types
	const elAccessMode = document.createElement("input")
	elAccessMode.type = "number"
	elAccessMode.placeholder = "Permission access mode"
	elAccessMode.value = 1
	elForm.appendChild(elAccessMode)
	
	// TODO: handle submitting
	const elSubmit = document.createElement("input")
	elSubmit.type = "submit"
	elSubmit.value = "Create permission"
	elForm.appendChild(elSubmit)


	return elForm


}



main()
