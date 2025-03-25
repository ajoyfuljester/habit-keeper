
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
	// TODO HEREREERERERE, check if api exists (definitely no)
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
