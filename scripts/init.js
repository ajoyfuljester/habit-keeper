/**
	* @returns {Promise<0>} exitCode, can throw errors though
*/
export async function init() {
	try {
		await Deno.mkdir("data", {mode: 0o700})
	} catch (error) {
		if (error instanceof Deno.errors.AlreadyExists) {
			return 0
		}
		throw error
	}

	return 0
}
