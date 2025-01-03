/**
	* @returns {number} unix timestamp in seconds
*/
export function now() {
	return Math.floor(Date.now() / 1000)
}

/**
	* @param {Date} dateToConvert - date object to convert
	* @returns {string} date in ISO format (YYYY-MM-DD)
*/
export function dateToISO(dateToConvert) {
	const date = dateToConvert ?? new Date()
	const year = date.getFullYear().toString().padStart(4, '0')
	const month = date.getMonth().toString().padStart(2, '0')
	const day = date.getDate() .toString().padStart(2, '0')

	return `${year}-${month}-${day}`

	
}

