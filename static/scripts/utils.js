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
	* @returns {Promise<false | Object>} data or false
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
	* @param {[String, String]} strings - text between the boardName
	* @param {String} boardName - name of the board, highlight target
	* @returns {String} combined text with `boardName` wrapped in <span>
*/
export function highlight(strings, boardName) {
	const wrapped = `<span class="highlight">${boardName}</span>`
	return strings[0] + wrapped + strings[1]
}
