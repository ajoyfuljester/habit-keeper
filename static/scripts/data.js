import { redirect } from './utils.js'

async function data() {
	const path = location.pathname

	if (!/\/profile\/\w+/.test(path)) {
		return false
	}
	
	const name = path.split('/')[2]

	const req = new Request(`/api/data/${name}/get`)
	const res = await fetch(req);
	const status = res.status
	if (status == 401) {
		redirect('/static/sites/login.html')
		return false
	}
	const result = await res.json();
	document.querySelector('#result').innerText = JSON.stringify(result);
}

data()
