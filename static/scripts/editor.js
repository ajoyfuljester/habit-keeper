import {fetchdata} from './data.js'

function main() {
	const data = fetchdata()
	if (!data) {
		return 1
	}

	// TODO: HERE 3
}

const exitCode = main()

console.log(exitCode)
