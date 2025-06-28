import * as Utils from "./utils.js";

/**
	* @typedef {Object} HandleAction object with types of objects, which have functions with actions that user can perform using requests
	* @property {Object} HandleAction.habit object with functions with actions that user can perform using requests on habits
	* @property {handleActionHabitCreate} HandleAction.habit.create creates a habit with data (see {@link handleActionHabitCreate})
	* @property {handleActionHabitRename} HandleAction.habit.rename renames a habit with name (see {@link handleActionHabitRename})
	* @property {handleActionHabitDelete} HandleAction.habit.delete deletes a habit with name (see {@link handleActionHabitDelete})
	* @property {Object} HandleAction.offset object with functions with actions that user can perform using requests on offsets
	* @property {handleActionOffsetCreate} HandleAction.offset.create creates an offset with data
	* @property {handleActionOffsetDelete} HandleAction.offset.delete delete an offset with habit name and day
	* @property {handleInit} HandleAction.init function that sends a request to /api/.../init
*/


/**
	* @type {HandleAction}
	* @see {@link HandleAction}
*/
export const HandleAction = {
	habit: {},
	offset: {},
}




/**
	* @callback handleActionHabitCreate
	* @param {String} habitName name of the habit to be created
	* @returns {Promise<0 | 1>} exitCode
*/
HandleAction.habit.create = async (habitName) => {
	const name = Utils.extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "create",
			type: "habit",
			what: {name: habitName},
		})
	})
	// TODO: logging here too
	
	const res = await fetch(req)
	
	if (!res.ok) {
		console.error(res)
		return 1
	}

	return 0
	
}

/**
	* @callback handleActionHabitDelete
	* @param {String} habitName name of the habit to be deleted
	* @returns {Promise<0 | 1>} exitCode
*/
HandleAction.habit.delete = async (habitName) => {
	const name = Utils.extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "delete",
			type: "habit",
			what: habitName,
		})
	})
	// TODO: logging here too
	
	const res = await fetch(req)
	
	if (!res.ok) {
		console.error(res)
		return 1
	}

	return 0
	
}


/**
	* @callback handleActionHabitRename
	* @param {String} oldHabitName current name of the habit
	* @param {String} newHabitName new name of the habit
	* @returns {Promise<0 | 1>} exitCode
*/
HandleAction.habit.rename = async (oldHabitName, newHabitName) => {
	const name = Utils.extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "rename",
			type: "habit",
			what: oldHabitName,
			toWhat: newHabitName,
		})
	})
	// TODO: logging here too
	
	const res = await fetch(req)
	
	if (!res.ok) {
		console.error(res)
		return 1
	}

	return 0
	
}


/**
	* @callback handleActionOffsetCreate
	* @param {String} habitName name of the habit that the offset is in
	* @param {Number} day offset offset/day thingy, days since `startingDate`
	* @param {Number} [value=1] value of the offset thingy
	* @returns {Promise<0 | 1>} exitCode
*/
HandleAction.offset.create = async (habitName, day, value = 1) => {
	const name = Utils.extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "create",
			type: "offset",
			where: habitName,
			what: [day, value],
		}), // i am so sorry for how i name these things
	})

	const res = await fetch(req)
	
	if (!res.ok) {
		console.error("create offset failed", res)
		return 1
	}
	return 0

}


/**
	* @callback handleActionOffsetDelete
	* @param {String} habitName name of the habit that the offset is in
	* @param {Number} day offset offset/day thingy, days since `startingDate`
	* @returns {Promise<0 | 1>} exitCode
*/
HandleAction.offset.delete = async (habitName, day) => {
	const name = Utils.extractName()
	const req = new Request(`/api/data/${name}/action`, {
		method: "POST",
		body: JSON.stringify({
			action: "delete",
			type: "offset",
			where: habitName,
			what: day,
		}),
	})

	const res = await fetch(req)
	
	if (!res.ok) {
		console.error("create offset failed", res)
		return 1
	}
	return 0

}


/**
	* @callback handleInit
	* @param  {Boolean} [force=false] if the data sjould be overwritten if it exists
	* @returns {Promise<Boolean>} exitCode
*/
HandleAction.init = async (force = false) => {
	const name = Utils.extractName()
	const res = await fetch(`/api/data/${name}/init${force ? '/force' : ''}`)
	return res.ok
}
