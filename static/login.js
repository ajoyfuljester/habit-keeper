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
	const result = await res.text()
	return result
}
function handleLogin() {
	const data = inputData()
	const result = login(data)
	return result
}

document.querySelector('input#login').addEventListener('click', handleLogin)
