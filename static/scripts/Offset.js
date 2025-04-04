export class Offset {
	/**
		* @typedef {[offset: Number, value: Number]} offsetArray - an object to be parsed into an instance of `Offset`
		* @param {offsetArray} offsetArray `[offset, value]` 
		* @returns {Offset} instance of `Offset`
	*/
	
	constructor([offset, value]) {
		if (!(offset && value)) {
			console.error('INVALID OFFSET')
			console.warn([offset, value])
		}

		/** @type {Number} offset in days from `startingDate` */
		this.day = offset;
		/** @type {Number} value of the day */
		this.value = value;

	}



	/**
		* @returns {[offset: Number, value: Number]} a simple object that is jsonifable
	*/
	toJSON() {
		return [this.day, this.value]
	}

}
