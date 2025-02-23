/**
	* @param {*} value step
	* @param {Number} max maximum value of `value`, minimum is `0`
	* @returns {String} css color (hsl)
*/
export function gradient(value, max) {
	if (value > max) {
		throw Error('value higher than max: value, max', value, max)
	}
	const step = Math.round(value / max * 100)
	return `hsl(120deg, ${step}%, 50%)`
}
