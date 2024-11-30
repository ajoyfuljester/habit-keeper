import { redirect } from './Utils.js'

async function data() {
	const req = new Request('/api/me/get')
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
