import * as HTMLUtils from "./HTMLUtils.js"
import { List } from "./List.js"

/**
	* @callback CreateItemHTMLCallback
	* @param {Item} item list item
	* @returns {HTMLDivElement} html div element
*/

/**
	* why ls works only if this `s` is lowercase
	* @type {Object.<string, CreateItemHTMLCallback>}
*/
const CreateItemHTML = {
	'Item': item => {
		const el = document.createElement('div')
		el.innerText = item.name
        return el
    },
	'ProgressItem': item => {
		const el = document.createElement('div')
		el.innerText = item.name
        return el
    },

}

export class ListView {

	/**
		* @param {Object} listViewObject 
		* @param {List} listViewObject.list 
	*/
	constructor({list}) {
		if (!(list)) {
			console.error('INVALID LIST VIEW')
			console.warn({list})
		}

		this.list = list

		this.#initiateHTML()
	}


	#initiateHTML() {
		const elList = document.createElement('div')
		HTMLUtils.prepareBaseViewElement(elList)

		for (const item of this.list.items) {
			const el = CreateItemHTML[item.type](item)

			HTMLUtils.prepareBaseViewElement(el)

			elList.appendChild(el)
		}

		this.html = elList

	}

}
