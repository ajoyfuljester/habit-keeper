

/**
	* @returns {HTMLAnchorElement} element that redirects to the editor
*/
export function createEditorLink() {
	const elLink = document.createElement('a')
	elLink.classList.add('cell')
	elLink.classList.add('editorLink')
	elLink.innerText = 'Editor'
	elLink.title = 'Go to editor'
	elLink.addEventListener('click', () => redirect(`/u/${extractName()}/editor`))

	return elLink
}


/**
	* @param {Date} date day to be displayed
	* @returns {HTMLDivElement} element with date information
*/
export function createDate(date) {
	const locale = navigator.language
	const elDate = document.createElement('div')
	elDate.classList.add('date')

	const elMonth = document.createElement('span')
	elMonth.classList.add('date-month')
	elMonth.innerText = Intl.DateTimeFormat(locale, {month: 'short'}).format(date)
	elDate.appendChild(elMonth)

	const elDay = document.createElement('span')
	elDay.classList.add('date-day')
	elDay.innerText = Intl.DateTimeFormat(locale, {day: 'numeric'}).format(date)
	elDate.appendChild(elDay)

	const elWeekday = document.createElement('span')
	elWeekday.classList.add('date-weekday')
	elWeekday.innerText = Intl.DateTimeFormat(locale, {weekday: 'short'}).format(date).toUpperCase()
	elDate.appendChild(elWeekday)

	return elDate
}


/**
	* @param {Date[]} dates days to be displayed
	* @returns {HTMLDivElement} parent element with elements of dates
*/
export function createDateSet(dates) {
	const elSet = document.createElement('div')
	for (const date of dates) {
		const el = createDate(date)
		elSet.appendChild(el)
	}

	return elSet
}


/**
	* @param {HTMLElement} el element to which classes and stuff will be applied
	* @param {String} name class which will be prefixed with `view-` and added to the element, it's mostly for the grid
*/
export function prepareBaseViewElement(el, name) {

	el.classList.add('subgrid')
	el.classList.add(`view-${name}`)

}

/**
	* @param {...String} strings text in cells
	* @returns {HTMLTableRowElement} table row element with cells filled with text from `strings`
*/
export function createRow(...strings) {
	const elRow = document.createElement("tr")
	for (const s of strings) {
		const elCell = document.createElement("td")
		elCell.textContent = s
		elRow.appendChild(elCell)
	}

	return elRow

}

/**
	* @param {...String} strings text in cells
	* @returns {HTMLTableRowElement} table row element with header cells filled with text from `strings`
*/
export function createRowHeader(...strings) {
	const elRow = document.createElement("tr")
	for (const s of strings) {
		const elCell = document.createElement("th")
		elCell.textContent = s
		elRow.appendChild(elCell)
	}

	return elRow

}
