import { redirect } from "./utils.js"
import { logout } from "./logout.js"

/**
	* @returns {Promise<0 | 1>}
	* `0` - success
	* `1` - not logged in
	* `2` - something went horribly wrong
	* `3` - no idea what went wrong
*/
async function handleLogout() {
	const result = await logout()

	if (result === 0) {
		redirect('/')
		return 0
	}

	alert('oops')
	return result
}


document.querySelector('.logout').addEventListener('click', handleLogout)
