
/**
	* @param {String} path - destination path (inside the server) that the client will be redirected to
	* @param {boolean} [top=true] whether it should redirect the top window
*/
export function redirect(path, top = true) {
	if (path[0] == '/') {
		path = path.substring(1)
	}
	const url = location.href
	const host = url.match(/.+\/\/.+?\//)[0]

	let w = window
	if (top) {
		w = w.top
	}

	window.top.location.assign(host + path)
}


/**
	* @returns user name extracted from the url
*/
export function extractName() {
	const path = location.pathname

	if (!/\/u\/\w+/.test(path)) {
		return false
	}
	
	const name = path.split('/')[2]

	return name;
}


/**
	* @returns {Promise<false | import("./Data.js").rawDataObject>} data or false
*/
export async function getData() {
	const name = extractName()

	if (!name) {
		console.error(location.pathname)
	}

	const req = new Request(`/api/data/${name}/get`)
	const res = await fetch(req);
	const status = res.status
	if (status == 401) {
		redirect('/static/sites/login.html')
		return false
	}
	const result = await res.json();

	return result
}


/**
	* @param {Date} dateToConvert date object to convert
	* @returns {String} date in ISO format (YYYY-MM-DD)
*/
export function dateToISO(dateToConvert) {
	const date = dateToConvert ?? new Date()
	const year = date.getFullYear().toString().padStart(4, '0')
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate() .toString().padStart(2, '0')

	return `${year}-${month}-${day}`

	
}

/**
	* @param {Date} dateToConvert date object to convert
	* @returns {String} time in ISO format (hh:mm:ss)
	* @see umm actually i don't know if this is ISO,
	* also probably the exact standard should be specified
*/
export function timeToISO(dateToConvert) {
	const date = dateToConvert ?? new Date()
	const hour = date.getHours().toString().padStart(2, '0')
	const minute = date.getMinutes().toString().padStart(2, '0')
	const second = date.getSeconds() .toString().padStart(2, '0')

	return `${hour}:${minute}:${second}`

	
}

/**
	* @param {Date} dateToConvert date object to convert
	* @returns {String} date and time in ISO format (YYYY-MM-DD hh:mm:ss)
	* @see umm actually i don't know if this is ISO,
	* also probably the exact standard should be specified
*/
export function datetimeToISO(dateToConvert) {
	return dateToISO(dateToConvert) + " " + timeToISO(dateToConvert)

	
}


/**
	* @param {Date} date anchor date, base, idk
	* @param {Number} [n=1] number of days to add to `date`, can be negative, 1 by default
	* @returns {Date} new `Date` object pointing to a new date (the next day by default)
*/
export function addDays(date, n = 1) {
	const miliseconds = date.getTime()
	const newMiliseconds = miliseconds + (n * 1000 * 60 * 60 * 24)
	return new Date(newMiliseconds)
}

/**
	* @param {Number} min lower bound (closed)
	* @param {Number} max higher bound (closed)
	* @returns {Number} random integer from a given set
*/
export function randomInteger(min, max) {
	if (min > max) {
		[min, max] = [max, min]
	}
	const values = max - min
	const fraction = Math.random()
	const value = values * fraction
	const rand = Math.round(value) + min
	return rand
}

export class DateList {

	/**
		* @param {Date[]} dates array of dates
	*/
	constructor(dates) {
		this.dates = dates ?? []
	}

	/**
		* @param {Date} date date for the index to be found
		* @returns {Number} index or -1 if not found
	*/
	findIndex(date) {
		const dateISO = dateToISO(date)
		const index = this.dates.findIndex(d => dateToISO(d) === dateISO)

		return index
	}

	/**
		* @returns {Number} number of the dates
	*/
	get length() {
		return this.dates.length
	}

	/**
		* @yields {Date} next date in `this.dates`
	*/
	*[Symbol.iterator]() {
		for (const date of this.dates) {
			yield date
		}
	}


}

/**
	* @param {Number} sourceValue 
	* @param {Number} sourceMin 
	* @param {Number} sourceMax 
	* @param {Number} destinationMin 
	* @param {Number} destinationMax 
*/
export function map(sourceValue, sourceMin, sourceMax, destinationMin, destinationMax) {
	const fraction = (sourceValue - sourceMin) / (sourceMax - sourceMin)
	return ((destinationMax - destinationMin) * fraction) + destinationMin
}


/**
	* @typedef {(Number | undefined)[][]} offsetGrid 2d array of offset values in a view 
*/

/**
	* @param {HabitView} view habit view
	* @returns {offsetGrid} 2d array of offset values in a view 
*/
export function dataToGrid(view) {
	const grid = []

	const habits = view.data.habits
	const rows = habits.length
	const dates = view.dates
	const columns = dates.length

	for (let y = 0; y < rows; y++) {
		const row = []
		for (let x = 0; x < columns; x++) {
			row[x] = habits[y].findOffsetByDate(dates[x])?.value
		}
		grid.push(row)
	}

	return grid
}


/**
	* @param {Number} min lower bound, inclusive
	* @param {Number} max higher bound, inclusive
	* @param {Number} value number that might be clamped
	* @returns {Number} clamped value if necessary to set [min, max]
*/
export function clamp(min, value, max) {
	return Math.max(Math.min(value, max), min)
}

/**
	* @param {Number} timestampInSeconds unix timestamp in seconds
	* @returns {Date} `Date` object
*/
export function dateFromDB(timestampInSeconds) {
	return new Date(timestampInSeconds * 1000)
}
