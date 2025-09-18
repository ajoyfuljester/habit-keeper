import * as Utils from "./utils.js";
import "./fuse.js";
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


const permissionDescriptions = ["Read data", "Write data", "Read permissions"]


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

	const elRowHeader = HTMLUtils.createRowHeader("Name", ...permissionDescriptions, "Access mode")
	elTable.appendChild(elRowHeader)

	for (const [name, accessMode] of Object.entries(guests)) {
		const elRow = document.createElement('tr')

		const elName = document.createElement('td')
		elName.textContent = name
		elRow.appendChild(elName)


		for (let i = 0; i < permissionDescriptions.length; i++) {
			const el = document.createElement("td")

			const elCheckBox = document.createElement("input")
			elCheckBox.type = "checkbox"
			elCheckBox.checked = checkPermission(accessMode, (i + 1) ** 2)
			el.appendChild(elCheckBox)


			elRow.appendChild(el)


		}

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

	const elFormButDiv = document.createElement("div")

	// TODO: headers. include this in a table?
	
	const elName = document.createElement("input")
	elName.type = "text"
	elName.placeholder = "Guest name"
	elFormButDiv.appendChild(elName)

	const elPermissionCheckboxes = permissionDescriptions.map(() => {
		const elCheckbox = document.createElement("input")
		elCheckbox.type = "checkbox"

		elFormButDiv.appendChild(elCheckbox)

		return elCheckbox

	})

	// TODO: add a creator for for choosing individually permission types
	const elAccessMode = document.createElement("input")
	elAccessMode.type = "number"
	elAccessMode.placeholder = "Permission access mode"
	elAccessMode.value = 0
	elAccessMode.addEventListener('input', () => {
		let accessMode = elAccessMode.valueAsNumber
		elPermissionCheckboxes.forEach(el => {
			el.checked = (accessMode & 1)
			accessMode = accessMode >> 1
		})
	})
	elFormButDiv.appendChild(elAccessMode)



	elPermissionCheckboxes.forEach(el => el.addEventListener('input', () => {
		const accessMode = elPermissionCheckboxes.map(el => +el.checked).reduceRight((prev, bit) =>  ((prev * 2) + bit), 0)
		elAccessMode.valueAsNumber = accessMode
	}))
	
	
	// TODO: handle submitting
	const elSubmit = document.createElement("input")
	elSubmit.type = "submit"
	elSubmit.value = "Create permission"
	elSubmit.addEventListener('click', () => {
		createPermission(elName.value, elAccessMode.valueAsNumber)
	})

	elFormButDiv.appendChild(elSubmit)


	return elFormButDiv


}


function createPermissionDialog() {
	const elDialog = document.createElement('dialog')



	// this is in reverse bit order

	const elPermissionCheckboxes = document.createElement("div")

	for (const pd of permissionDescriptions) {
		const elLabel = document.createElement("label")

		const elDescription = document.createElement("span")
		elDescription.textContent = pd
		elLabel.appendChild(elDescription)


		const elCheckbox = document.createElement("input")
		elCheckbox.type = "checkbox"
		elLabel.appendChild(elCheckbox)


		elPermissionCheckboxes.appendChild(elLabel)

	}

	elDialog.appendChild(elPermissionCheckboxes)


	const elConfirm = document.createElement('input')
	elConfirm.type = "button"
	elConfirm.value = "Confirm"

	elDialog.appendChild(elConfirm)


	return elDialog


}

/**
	* @param {Number} mode whole access permissions
	* @param {Number} permission permission that will be checked if are available
	* @returns {Boolean} isAvailable access with the given permission mode
*/
function checkPermission(mode, permission) {
	return (mode & permission) === permission
}




/**
	* @param {String} guest name of the user, who will gain access
	* @param {Number} accessMode given permissions
	* @returns {0 | 1 | 2} error code, page is reloaded on code 0 success
	* `1` - could not get name from url somehow
	* `2` - request failed
*/
async function createPermission(guest, accessMode) {
	const owner = Utils.extractName()
	if (!owner) {
		return 1
	}

	console.table({guest, owner, accessMode})

	const req = new Request(`/api/permission/${owner}`, {
		method: "POST",
		body: JSON.stringify({
			guest: guest,
			accessMode: accessMode,
		}),
	})


	const res = await fetch(req)

	if (!res.ok) {
		// TODO: display these failures on the screen
		console.error("error: cannot create a permission", res)
		return 2
	}

	// requests might not appear completed in browser dev tools
	location.reload()

	return 0

}

main()
