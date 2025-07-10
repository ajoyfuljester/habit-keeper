import * as Utils from './utils.js'

/**
	* @typedef {Object} HSL object with functions that handle converting arguments to css colors
	* @property {hueLightness} HSL.HL from hue and lightness
	* @property {hueSaturation} HSL.HL from hue and lightness
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
	* @callback hueSaturation
	* @param {Number} hue hue
	* @param {Number} saturation saturation
	* @returns {String} css hsl color
*/
HSL.HS = (hue, saturation) => `hsl(${hue}deg, ${Math.max(saturation % 100, 100)}%, 50%)`;

// TODO: rewrite this to be more universal
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

export const Functions = {



}

/** @type {colorFunction} */
export function gradientHL({columns, rows, lightnessMin, lightnessMax, hueMin, hueMax}) {
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




/** @type {colorFunction} */
export function random({columns, rows}) {
	const colors = []
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < columns; x++) {
			const color = HSL.HS(
				Utils.randomInteger(0, 359),
				Utils.randomInteger(50, 100),
			)
			colors.push(color)
		}
	}

	return colors
}


/**
	* @param {import('./utils.js').offsetGrid} grid 
	* @param {String[]} colors array of css colors
*/
export function islands(grid, colors) {
	// empty 2d array
	const result = grid.map(a => a.map(() => undefined))

	let id = 1

	for (let y = 0; y < result.length; y++) {
		for (let x = 0; x < result[y].length; x++) {
			if (islandsRecursive(grid, x, y, id, result) !== 0) {
				id += 1
			}
		}
	}
	
	const numberOfColors = colors.length

	const resultResult = result.flat().map(id =>{
		if (id === undefined) {
			return 0;
		}
		return id;
    } ).map(id => colors[id % numberOfColors])
	console.log(resultResult)

	return resultResult
}


/**
	* @param {import('./utils.js').offsetGrid} grid 
	* @param {Number} x 
	* @param {Number} y 
	* @param {Number} id 
	* @param {(Number | undefined)[][]} result 
	* @returns {Number} n number of offsets in an island?
*/
function islandsRecursive(grid, x, y, id, result) {
	let n = 0

	if ((grid[y][x] === undefined) || (result[y][x] !== undefined)) {
		return n
	}

	result[y][x] = id
	n += 1


	if (x !== 0) {
		n += islandsRecursive(grid, x - 1, y, id, result)
	}

	if (y !== 0) {
		n += islandsRecursive(grid, x, y - 1, id, result)
	}

	if (x !== grid[0].length - 1) {
		n += islandsRecursive(grid, x + 1, y, id, result)
	}

	if (y !== grid.length - 1) {
		n += islandsRecursive(grid, x, y + 1, id, result)
	}

	return n
}
