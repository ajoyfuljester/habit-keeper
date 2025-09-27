export class NotificationDaemon {

	constructor() {

		this.html = document.createElement("div")
		this.html.classList.add("notification-daemon")


		/** @type {NotificationLocal[]} array of currently displayed notifications */
		this.notifications = []


	}



	/**
		* @param {NotificationLocal} notification nofication which will be displayed on the screen
	*/
	async notify(notification) {

		this.notifications.push(notification)

		this.html.appendChild(notification.html)


		await notification.html.animate([
			{opacity: 1},
		], 600).finished

		setTimeout(async () => {
			await notification.html.animate([
				{opacity: 0},
			], 1000).finished

			notification.html.remove()
			// why doesn't javascript have functions for deleting precise items...
			// i don't want to write it myself
			this.notifications.shift()
		}, 10000)

	}


	/**
		* @param {String} summary notification header
		* @param {String} body notification text
		* @param {Number} [timeoutInMiliseconds=2000] notification timeout delay
		* @param {Number} [priority=1] notification priority level
	*/
	notifyRaw(summary, body, timeoutInMiliseconds, priority) {
		const notification = new NotificationLocal(summary, body, timeoutInMiliseconds, priority)

		return this.notify(notification)
	}


}


export class NotificationLocal {

	static badnessLevels = ["good", "neutral", "bad"]
	/**
		* @param {String} summary notification header
		* @param {String} body notification text
		* @param {Number} [timeoutInMiliseconds=2000] notification timeout delay
		* @param {Number} [priority=1] notification priority level
	*/
	constructor(summary, body, timeoutInMiliseconds = 2000, priority = 1) {

		this.summary = summary
		this.body = body
		this.timeout = timeoutInMiliseconds


		this.html = document.createElement("div")
		this.html.classList.add("notification")
		this.html.classList.add("badness-" + NotificationLocal.badnessLevels[priority])

		const elHeader = document.createElement("header")
		const elH2 = document.createElement("h2")
		elH2.textContent = this.summary
		elHeader.appendChild(elH2)
		this.html.appendChild(elHeader)

		const elP = document.createElement("p")
		elP.textContent = body
		this.html.appendChild(elP)


	}


}

export function initDaemon() {
	const nd = new NotificationDaemon()
	document.body.appendChild(nd.html)

	return nd

}

export const GLOBAL_NOTIFICATION_DAEMON = new NotificationDaemon()
