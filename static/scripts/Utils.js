export function redirect(path) {
	if (path[0] == '/') {
		path = path.substring(1)
	}
	console.log(path)
	const url = location.href
	const host = url.match(/.+\/\/.+?\//)[0]
	location.assign(host + path)
}
