/**
	* @param {Number} value step
	* @param {Number} max maximum value of `value`, minimum is `0`
	* @param {Number} hue hue of the gradient (0 to 360)
	* @returns {String} css color (hsl)
*/
export function gradient(value, max, hue) {
	if (value > max) {
		throw Error('value higher than max: value, max', value, max)
	}
	const step = 100 - (Math.round(value / max * 40) + 10)
	return `hsl(${hue}deg, 100%, ${step}%)`
}
