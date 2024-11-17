function inputData() {
	const name = document.querySelector('input#name').value
	const password = document.querySelector('input#password').value
	return { name, password }
}

async function login(data) {
	const request = new Request('/api/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	});
	const response = await fetch(request);
	const result = await response.text()
	return result
}
function handleLogin() {
	const data = inputData()
	const result = login(data)
	return result
}

document.querySelector('input#login').addEventListener('click', handleLogin)
