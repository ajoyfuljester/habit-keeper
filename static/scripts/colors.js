/**
	* @typedef {Object} colorFunctionArgument object containing arguments for color function
	* @property {Number} colorFunctionArgument.x number of dates
	* @property {Number} colorFunctionArgument.y number of habits
*/

/**
	* @callback colorFunction
	* @param {colorFunctionArgument} object with arguments 
	* @returns {String[][]} 2d array with css colors
*/


/* @type {colorFunction} */
export function gradient({x, y}) {
	const colors = []
	for (let i of x) {
		const row = []
		for (let j of y) {
			row.push()
		}
	}
	return `hsl(${hue}deg, 100%, ${step}%)`
}

// TODO: use that funny functions ``````````````
const HSL = {}

