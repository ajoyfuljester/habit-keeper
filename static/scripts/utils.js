export function redirect(path) {
	if (path[0] == '/') {
		path = path.substring(1)
	}
	const url = location.href
	const host = url.match(/.+\/\/.+?\//)[0]
	location.assign(host + path)
}

export function extractName() {
	const path = location.pathname

	if (!/\/profile\/\w+/.test(path)) {
		return false
	}
	
	const name = path.split('/')[2]

	return name;
}

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
	console.log("data:", result)
}
