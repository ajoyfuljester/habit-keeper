import { redirect } from './utils.js';


/**
	* @returns {{name: String, password: String}} object with name and password from the inputs
*/
function inputData() {
	const name = document.querySelector('input#name').value
	const password = document.querySelector('input#password').value
	return { name, password }
}


/**
	* @param {{name: String, password: String}} data - object with user name and password
	* @returns {Promise<{code: Number}>} objec with `code` property which indicates status of the log in attempt
	* `0` - sucess
	* `1` - user not found
	* `2` - password is incorrect
*/
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


/**
	* get data from inputs, attempt to log in, display result, if successful then redirect to user page
*/
async function handleLogin() {
	const data = inputData()
	const result = await login(data)
	const code = result.code;

	let message = ''
	if (code == 0) {
		message += 'Succes'
		redirect(`/u/${data.name}/habits`)
	} else if (code == 1) {
		message += 'User not found';
	} else if (code == 2) {
		message += 'Password is incorrect';
	}

	document.querySelector('#result').innerText = message
		
}


/**
	* check if logged in, dispkay rasult, if logged then redirect to user page
*/
async function handleAlreadyLoggedIn() {
	const nameRes = await fetch('/api/who')
	const json = await nameRes.json()

	if (!json) {
		document.querySelector('#result').innerText = 'Not logged in';
		return false
	}

	redirect(`/u/${json.name}/habits`)
}

async function handleDefaultLogin() {
	const res = await fetch('/api/login/default')
	if (res.status !== 200) {
		document.querySelector('#result').innerText = 'Default login failed';
	}

	const whoRes = await fetch('/api/who')
	const json = await whoRes.json()


	if (!json) {
		document.querySelector('#result').innerText = 'Failed to find name';
	}

	redirect(`/u/${json.name}/habits`)
}

document.querySelector('input#login').addEventListener('click', handleLogin)

document.querySelector('input#alreadyLoggedIn').addEventListener('click', handleAlreadyLoggedIn)

document.querySelector('input#defaultLogin').addEventListener('click', handleDefaultLogin)

document.querySelector('input#register').addEventListener('click', () => { redirect('/register') })
