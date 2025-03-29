
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
	* get data from inputs, attempt to register a new user, display result, if successful then redirect to user page
	* @returns {0 | 1 | 2 | 3 | 4} exit code
	* `0` - success
	* `1` - user exists
	* `2` - invalid user name
	* `3` - invalid password
	* `4` - entered passwords do not match
	* @see api route
*/
async function handleRegister() {
	const data = inputData()


	if (data.password !== data.confirmPassword) {
		document.querySelector("#result").innerText = 'Entered passwords do not match'
		return 4
	}


	const code = await register(data.name, data.password)

	let message = ''
	if (code === 0) {
		message += `Succes a user with a name ${data.name} has been created. You can now go and try to <a href="/login">log in</a>`
	} else if (code === 1) {
		message += `User with the name "${data.name}" already exists`;
	} else if (code === 2) {
		message += `Name "${data.name}" contains invalid characters`;
	} else if (code === 3) {
		message += `Password contains invalid characters`;
	}


	document.querySelector("#result").innerHTML = message

	return code
		
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

document.querySelector('#register').addEventListener('click', handleRegister)
