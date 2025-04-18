/**
	* @callback colorFuncion
	* @param {Object} info information about the cell to color
	* @property {Number?} info.x x position (date)
	* @property {Number?} info.y y position (habit)
	* @returns {String} color string
*/


/**
	* @param {Number} max maximum value of `value`, minimum is `0`
	* @param {Number} hue hue of the gradient (0 to 360)
	* @returns {colorFuncion} css color (hsl)
*/
export function gradient(max, hue) {
	return ({x}) => {
		const step = 100 - (Math.round(x / max * 40) + 10)
		return `hsl(${hue}deg, 100%, ${step}%)`
	}
}
