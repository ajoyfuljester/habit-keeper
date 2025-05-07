import { View } from "./View";


class Page {
	/**
		*
	*/
	constructor() {

		/** @type {View[]} array of views, used for updating */
		this.views = []
	}

	/**
		* @param {import("./View").viewObject} view View that will be added
	*/
	createView(viewObject) {

		viewObject.page = this



		this.views.push(view)
	}
}
