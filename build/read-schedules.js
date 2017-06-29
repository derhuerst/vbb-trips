'use strict'

const so       = require('so')
const lib      = require('./lib')



const readSchedules = so(function* () {



	let schedules = yield lib.readCsv('calendar.txt', (acc, sched) => {
		let days  = []
		const first = lib.parseDate(sched.start_date)
		const last  = lib.parseDate(sched.end_date)

		// assemble the list of days
		for (let i = 0; i < lib.weekdays.length; i++) {
			if (parseInt(sched[lib.weekdays[i]]))
				days = days.concat(lib.allDaysOfWeekday(first, last, i)
					.map((d) => d / 1000))
		}

		const id = parseInt(sched.service_id)
		acc[id] = {id, days}
		return acc
	}, Object.create(null))



	schedules = yield lib.readCsv('calendar_dates.txt', (acc, exception) => {
		const sched = acc[parseInt(exception.service_id)]
		if (!sched) return acc

		const date = lib.parseDate(exception.date) / 1000
		const type = parseInt(exception.exception_type)
		const i = sched.days.indexOf(date)
		if (type > 0 && i < 0) sched.days.push(date) // add
		else if (type === 0 && i >= 0) sched.days.splice(i, 1) // remove

		return acc
	}, schedules)



	return schedules
})

module.exports = readSchedules
