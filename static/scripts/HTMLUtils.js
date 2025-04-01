

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
	elMonth.innerText = Intl.DateTimeFormat(locale, {month: 'long'}).format(date)
	elDate.appendChild(elMonth)

	const elDay = document.createElement('span')
	elDay.innerText = Intl.DateTimeFormat(locale, {day: 'numeric'}).format(date)
	elDate.appendChild(elDay)

	const elWeekday = document.createElement('span')
	elWeekday.innerText = Intl.DateTimeFormat(locale, {weekday: 'long'}).format(date)
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


