import { redirect } from './Utils.js';


function inputData() {
	const name = document.querySelector('input#name').value
	const password = document.querySelector('input#password').value
	return { name, password }
}

async function login(data) {
	const req = new Request('/api/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});
	const res = await fetch(req);
	const result = await res.json()
	return result
}
async function handleLogin() {
	const data = inputData()
	const result = await login(data)
	const code = result.code;

	let message = ''
	if (code == 0) {
		message += 'Succes'
		redirect('/static/sites/dashboard.html')
	}	else if (code == 1) {
		message += 'Profile not found';
	} else if (code == 2) {
		message += 'Password is incorrect';
	}

	document.querySelector('#result').innerText = message
		
}

document.querySelector('input#login').addEventListener('click', handleLogin)
