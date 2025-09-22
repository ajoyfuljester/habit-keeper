




function main() {


}



class NotificationDaemon {

	constructor() {

		this.html = document.createElement("div")
		this.html.classList.add("notification-daemon")


		this.notifications = []


	}


}


class NotificationLocal {

	static priorityClasses = ["low", "medium", "high"]
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
		this.html.classList.add(NotificationLocal.priorityClasses[priority])

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



main()
