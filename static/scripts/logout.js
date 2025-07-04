

/**
	* @returns {Promise<0 | 1 | 2 | 3>} errorCode
	* `0` - success
	* `1` - not logged in
	* `2` - something went horribly wrong
	* `3` - no idea what went wrong
*/
export async function logout() {
	const req = await fetch('/api/logout')

	if (req.ok) {
		return 0
	}

	if (req.status === 401) {
		return 1
	}

	if (req.status === 500) {
		return 2
	}

	console.error('this should be unreachable')

	return 3
}
