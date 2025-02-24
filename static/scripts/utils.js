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
	* @typedef {Object} dataObject - raw data object from the server
	* @property {import("./habits").habitObject[]} habits - array of habit-like objects
	*
	* @returns {Promise<false | dataObject>} data or false
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
	* @param {String} startingDate date in the format `YYYY-MM-DD`
	* @param {Date} date date object to convert to a relative offset
	* @returns {Number} number of days since `startingDate` to `date`
*/
export function dateToOffset(startingDate, date) {
	const startDate = new Date(startingDate)
	const difference = date.getTime() - startDate.getTime()
	const offset = Math.floor(difference / (1000 * 60 * 60 * 24))

	return offset
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
