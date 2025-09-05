import * as Utils from "./utils.js";

async function main() {
	const name = Utils.extractName()

	const req = new Request(`/api/permission/${name}`, {
		method: "GET",
	})

	const res = await fetch(req)


	if (!res.ok) {
		return 1
	}

	// TODO: add the correct type here
	/** @type {import("../../scripts/database.js").Permission} */
	const data = await res.json()

	console.log(data)


}


main()
