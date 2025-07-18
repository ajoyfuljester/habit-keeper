export class List {
	/**
		* @param {Object} listObject 
		* @param {String} listObject.name 
		* @param {Item[]} listObject.items 
	*/
	constructor({name, items}) {
		if (!(name && (items.length !== 0))) {
			console.error('INVALID LIST')
			console.warn({name, items})
		}

		this.name = name
		this.items = items

	}

}


class Item {
	/**
		* @param {Object} itemObject 
		* @param {String} [itemObject.name = false] 
		* @param {Boolean} itemObject.isCompleted 
	*/
	constructor({name, isCompleted = false}) {
		if (!(name)) {
			console.error('INVALID ITEM')
			console.warn({name, isCompleted})
		}

		this.name = name
		this.isCompleted = isCompleted
	}

	type = 'Item'
}


class ProgressItem extends Item {
	/**
		* @param {Object} progressItemObject 
		* @param {String} progressItemObject.name 
		* @param {Boolean} [progressItemObject.isCompleted = false]
		* @param {Number} progressItemObject.max
	*/
	constructor({name, isCompleted, max, progress = 0}) {
		if (!(name && max)) {
			console.error('INVALID PROGRESS ITEM')
			console.warn({name, isCompleted, max, progress})
		}

		super({name, isCompleted})

		this.progress = progress
		this.max = max



	}
	
	type = 'ProgressItem'

}
