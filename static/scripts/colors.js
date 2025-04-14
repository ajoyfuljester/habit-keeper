/**
	* @callback colorSimpleFuncion
	* @param {Number} step step/index of the color to be reurned
	* @returns {String} color string
*/


/**
	* @param {Number} max maximum value of `value`, minimum is `0`
	* @param {Number} hue hue of the gradient (0 to 360)
	* @returns {colorSimpleFuncion} css color (hsl)
*/
export function gradient(max, hue) {
	return (value) => {
		const step = 100 - (Math.round(value / max * 40) + 10)
		return `hsl(${hue}deg, 100%, ${step}%)`
	}
}
