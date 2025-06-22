/**
	* @param {String} path - destination path (inside the server) that the client will be redirected to
*/
export function redirect(path) {
	if (path[0] == '/') {
		path = path.substring(1)
	}
	const url = location.href
	const host = url.match(/.+\/\/.+?\//)[0]
	location.assign(host + path)
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
	* @returns {Promise<false | import("./Data").rawDataObject>} data or false
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
	* @param {Date} dateToConvert - date object to convert
	* @returns {String} date in ISO format (YYYY-MM-DD)
*/
export function dateToISO(dateToConvert) {
	const date = dateToConvert ?? new Date()
	const year = date.getFullYear().toString().padStart(4, '0')
	const month = date.getMonth().toString().padStart(2, '0')
	const day = date.getDate() .toString().padStart(2, '0')

	return `${year}-${month}-${day}`

	
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


