import { HabitView } from "./HabitView.js";
import { HandleAction } from "./action.js";

export class Page {
	/**
		*
	*/
	constructor() {

		/** @type {HabitView[]} array of views, used for updating */
		this.views = []
	}

	/**
		* @param {import("./HabitView").habitViewObject} viewObject object that will be parsed into HabitView and added
	*/
	createView(viewObject) {
		viewObject.page = this
		view = HabitView(viewObject)

		this.views.push(view)
	}

	/**
		* @param {HabitView} view view that will be added
	*/
	addView(view) {
		this.views.push(view)
	}

	/**
		* @param {Boolean} isOffset whether to delete (`true`) or create (`false`) offset
		* @param {String} habitName name of the habit to create offset for
		* @param {String} offsetDay day of the offset
		* @param {Number} [offsetValue=1] value of the offset
		* @returns {Promise<0 | 1>} exitCode propagated from HandleAction
	*/
	async handleOffsetToggle(isOffset, habitName, offsetDay, offsetValue = 1) {
		let result;

		if (isOffset) {
			result = await HandleAction.offset.delete(habitName, offsetDay)
		} else {
			result = await HandleAction.offset.create(habitName, offsetDay, offsetValue)
		}

		console.log(result)


		if (result !== 0) {
			return result
		}

		console.log(this.views)

		if (isOffset) {
			for (const view of this.views) {
				view.deleteOffset(habitName, offsetDay)
			}
		} else {
			for (const view of this.views) {
				view.setOffset(habitName, offsetDay, offsetValue)
			}
		}


		return result

	}



}
