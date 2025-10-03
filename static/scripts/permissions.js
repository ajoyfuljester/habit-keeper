import * as Utils from "./utils.js";
import "./fuse.js";
import * as HTMLUtils from "./HTMLUtils.js";
import { GLOBAL_NOTIFICATION_DAEMON } from "./notification.js";

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
	el.classList.add("permissions")

	const elGuests = createGuestsElement(data.guests)

	el.appendChild(elGuests)



	const elOwners = document.createElement("div")

	// TODO: also a search bar

	const elOwnersSearchByName = document.createElement("input")
	elOwnersSearchByName.type = "text"
	elOwnersSearchByName.placeholder = "Search owners by name"
	elOwnersSearchByName.classList.add("search")

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
function createGuestsElement(guests) {
	const elGuests = document.createElement("div")

	// TODO: search bar
	// table... rows... display none...
	// also a button for deleting? or maybe an input for changing... also maybe a popup for creating/chaning

	const elSearchByName = document.createElement("input")
	elSearchByName.type = "text"
	elSearchByName.placeholder = "Search guests by name"
	elSearchByName.classList.add("search")

	elGuests.appendChild(elSearchByName)

	const elTable = document.createElement("table")

	const elCreator = createGuestsCreator()
	elTable.appendChild(elCreator)



	const elTHead = document.createElement('thead')
	const elRowHeader = HTMLUtils.createRowHeader("Name", ...permissionDescriptions, "Access mode")
	elTHead.appendChild(elRowHeader)
	elTable.appendChild(elTHead)

	const elTBody = document.createElement('tbody')
	elTBody.classList.add("table-data")
	elTBody.classList.add("permission-guests")


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
			elCheckBox.disabled = true
			el.appendChild(elCheckBox)


			elRow.appendChild(el)


		}

		const elAccessMode = document.createElement('td')
		elAccessMode.textContent = accessMode
		elRow.appendChild(elAccessMode)


		elTBody.appendChild(elRow)

	}

	elTable.appendChild(elTBody)
	elGuests.appendChild(elTable)


	return elGuests


}


/**
	* @returns {HTMLTableRowElement} form element with inputs for creating a permission for someone
*/
function createGuestsCreator() {

	const elTBody = document.createElement("tbody")
	const elRow = document.createElement("tr")

	
	const elCellName = document.createElement('td')
	const elName = document.createElement("input")
	elName.type = "text"
	elName.placeholder = "Guest name"
	elCellName.appendChild(elName)
	elRow.appendChild(elCellName)

	const elPermissionCheckboxes = permissionDescriptions.map(() => {
		const elCellCheckbox = document.createElement('td')
		const elCheckbox = document.createElement("input")
		elCheckbox.type = "checkbox"

		elCellCheckbox.appendChild(elCheckbox)
		elRow.appendChild(elCellCheckbox)

		return elCheckbox

	})

	const elCellAccessMode = document.createElement("td")
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
	elCellAccessMode.appendChild(elAccessMode)
	elRow.appendChild(elCellAccessMode)



	elPermissionCheckboxes.forEach(el => el.addEventListener('input', () => {
		const accessMode = elPermissionCheckboxes.map(el => +el.checked).reduceRight((prev, bit) =>  ((prev * 2) + bit), 0)
		elAccessMode.valueAsNumber = accessMode
	}))
	
	
	const elCellSubmit = document.createElement("td")
	const elSubmit = document.createElement("input")
	elSubmit.type = "submit"
	elSubmit.value = "Create permission"
	elSubmit.addEventListener('click', () => {
		createPermission(elName.value, elAccessMode.valueAsNumber)
	})

	elCellSubmit.appendChild(elSubmit)
	elRow.appendChild(elCellSubmit)

	elTBody.appendChild(elRow)


	return elTBody


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

		GLOBAL_NOTIFICATION_DAEMON.notifyRaw("Permission NOT created", `Permission for user "${guest}" and access mode ${accessMode} has NOT been created`, 2)
		console.error("failure: permission creation", res)
		return 2
	}

	GLOBAL_NOTIFICATION_DAEMON.notifyRaw("Permission created", `Permission for user "${guest}" and access mode ${accessMode} has been created`, 0)

	// requests might not appear completed in browser dev tools
	location.reload()

	return 0

}

main()
