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
	console.log(result)
	const {token, maxAge} = result;
	document.cookie = `token=${token}; Max-Age=${maxAge || 1000*60*3}; SameSite=Strict; Secure; Path=/`
		
}

document.querySelector('input#login').addEventListener('click', handleLogin)
