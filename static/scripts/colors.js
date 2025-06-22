import * as Utils from './utils.js'

/**
	* @typedef {Object} HSL object with functions that handle converting arguments to css colors
	* @property {hueLightness} HSLaaa.HL from hue and lightness
*/


/** @type {HSL} */
const HSL = {
}

/**
	* @callback hueLightness
	* @param {Number} hue hue
	* @param {Number} lightness lightness
	* @returns {String} css hsl color
*/
HSL.HL = (hue, lightness) => `hsl(${hue}deg, 100%, ${lightness}%)`;


/**
	* @typedef {Object} colorFunctionArgument object containing arguments for color function
	* @property {Number} colorFunctionArgument.columns number of dates
	* @property {Number} colorFunctionArgument.rows number of habits
	* @property {Number} colorFunctionArgument.hueMin minimal hue
	* @property {Number} colorFunctionArgument.hueMax maximal hue not always used
	* @property {Number} colorFunctionArgument.lightnessMin minimal lightness
	* @property {Number} colorFunctionArgument.lightnessMax maximal lightness
*/

/**
	* @callback colorFunction
	* @param {colorFunctionArgument} object with arguments 
	* @returns {String[]} array with css colors for each cell
*/

// TODO: colors can be static or dynamic!!

/** @type {colorFunction} */
export function gradient2({columns, rows, lightnessMin, lightnessMax, hueMin, hueMax}) {
	const colors = []
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < columns; x++) {
			const color = HSL.HL(
				Utils.map(y, 0, rows - 1, hueMin, hueMax),
				Utils.map(x, 0, columns - 1, lightnessMin, lightnessMax)
			)
			colors.push(color)
		}
	}

	return colors
}

// console.log(gradient2({x: 5, y: 5, lightnessMin: 20, lightnessMax: 80, hueMin: 0, hueMax: 360}))



