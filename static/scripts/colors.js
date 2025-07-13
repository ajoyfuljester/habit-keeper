import * as Utils from './utils.js'


/**
	* @callback colorFunction function which calculates colors for a view
	* @returns {String[]} array of css colors
*/

/**
	* @typedef {Object} colorObject object containing information about a color function
	* @property {String} colorObject.name name of the function
	* @property {Boolean} colorObject.isDynamic whether colors depend on the existing offsets
	* @property {colorFunction} colorObject.function function which calculates the colors
*/

/** @type {colorObject[]} */
export const Colors = [
	{ name: "Gradient 2D HSL", isDynamic: false },
	{ name: "Random", isDynamic: false },
	{ name: "Islands", isDynamic: true },


]


const ColorToString = {
	HSL: ({ h = 270, s = 100, l = 50}) => `hsl(${h}deg, ${Utils.clamp(0, s, 100)}%, ${Utils.clamp(0, l, 100)}%)`,
}







// TODO: colors can be static or dynamic!!


/**
	* @typedef {[min: Number, max: Number]} range
*/

/**
	* @param {Object} colorArgument 
	* @param {Number} colorArgument.columns number of columns
	* @param {Number} colorArgument.rows number of rows
	* @param {Object} colorArgument.ranges object with ranges for color parameters
	* @param {range} colorArgument.ranges.h hue range
	* @param {range} colorArgument.ranges.s saturation range
	* @param {range} colorArgument.ranges.l lightness range
	* @param {String} [colorArgument.dirH='h'] direction of the colors habit-wise
	* @param {String} [colorArgument.dirD='l'] direction of the colors date-wise
*/
Colors[0].function = ({columns, rows, ranges, dirH = 'h', dirD = 'l'}) => {
	const colors = []
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < columns; x++) {
			const color = ColorToString.HSL({
				[dirH]: Utils.map(y, 0, rows - 1, ranges[dirH][0], ranges[dirH][1]),
				[dirD]: Utils.map(x, 0, columns - 1, ranges[dirD][0], ranges[dirD][1])
			})
			colors.push(color)
		}
	}

	return colors
}




Colors[1].function = ({columns, rows}) => {
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



// TODO: shaded islands or whatever


/**
	* @param {import('./utils.js').offsetGrid} grid 
	* @param {String[]} colors array of css colors
*/
Colors[2].function = (grid, colors) => {
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
