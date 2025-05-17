import { HabitView } from "./HabitView.js";

export class Page {
	/**
		*
	*/
	constructor() {

		/** @type {View[]} array of views, used for updating */
		this.views = []
	}

	/**
		* @param {import("./HabitView").habitViewObject} viewObject HabitView that will be added
	*/
	createView(viewObject) {
		viewObject.page = this
		view = HabitView(viewObject)

		this.views.push(view)
	}


	async handleOffsetToggle(bool, habitName, offsetDay, offsetValue = 1) {
		let result;

		// TODO: test if this works
		console.log(bool)

		if (bool) {
			result = await HandleAction.offset.delete(habitName, offsetDay)
		} else {
			result = await HandleAction.offset.create(habitName, offsetDay, offsetValue)
		}


		if (result !== 0) {
			return result
		}


		for (const view of this.views) {
			view.setOffset(habitName, offsetDay, offsetValue)
		}

	}



}
