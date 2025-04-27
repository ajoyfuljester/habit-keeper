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
		* @param {View} view View that will be added
	*/
	addView(view) {
		for (const elOffset of view.html.querySelector('.view-offsets').children) {
			// TODO: idk if this is the right way to do it sorry
			elOffset.addEventListener()
		}

		this.views.push(view)
	}
}
