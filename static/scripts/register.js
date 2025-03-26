
/**
	* @returns {{name: String, password: String, confirmPassword: String}} object with name and password and confirmPassword from the inputs
*/
function inputData() {
	const name = document.querySelector('input#name').value
	const password = document.querySelector('input#password').value
	const confirmPassword = document.querySelector('input#confirmPassword').value
	return { name, password, confirmPassword }
}


/**
	* get data from inputs, attempt to log in, display result, if successful then redirect to user page
*/
async function handleRegister() {
	const data = inputData()


	if (data.password !== data.confirmPassword) {
		return 1
	}

	// TODO HEEEEREEEEEEE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	const result = await register(data.name, data.password)
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
	* @param {String} name name of the user to be created
	* @param {String} password password of the user to be created
	* @returns {Promise<Number>} response code
*/
async function register(name, password) {
	const req = new Request(`/api/register`, {
		method: "POST",
		body: JSON.stringify({
			name,
			password,
		})
	})
	// TODO: logging here too
	
	const res = await fetch(req)
	
	const responseData = await res.json()

	return responseData.code

}
