'use strict'

// This build scripts tries to reduce the amount of implicitly redundant data, coming from the GTFS dumps.
// - calendar.txt and calendar_dates.txt get merged. For each schedule, only a list of days (on which they are valid) is kept.
// - trips.txt and stop_time.txt get merged. Because relative travel times are used, a lot of now redundant trips can be removed.

const so       = require('so')
const Download = require('download')
const path     = require('path')
const fs       = require('fs')
const csv      = require('csv-parse')
const moment   = require('moment')
const keyMap   = require('key-map')
const hash     = require('shorthash').unique



const parseAgency = (agency) => agency.replace(/[^a-zA-Z0-9]+$/, '')

const lineTypes = {
	  100:	'regional'
	, 102:	'regional'
	, 109:	'suburban'
	, 400:	'subway'
	, 700:	'bus'
	, 900:	'tram'
	, 1000:	'ferry'
}



const parseDate = (date) => moment([
	  date.substr(0, 4)
	, date.substr(4, 2)
	, date.substr(6, 2)
].join('-')).valueOf()

const parseTime = (time) => moment.duration(time).asMilliseconds()

const day = 24 * 60 * 60 * 1000
const daysBetween = (first, last) => {
	const days = []
	for (let i = first; i <= last; i += day) {days.push(i)}
	return days
}

const equalDays = (a, b) => {
	for (let i = 0; i < a.length; i++)
		{if (a[i] !== b[i]) return false}
	return true
}

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const isWeekday = (weekday) => (day) =>
	new Date(day).getDay() === weekday
const allDaysOfWeekday = (first, last, weekday) =>
	daysBetween(first, last).filter(isWeekday(weekday))



const dir = path.join(__dirname, 'data')
const readCsv = (file, reducer, acc) => new Promise((yay, nay) => {
	fs.createReadStream(path.join(dir, file))
	.pipe(csv({columns: true})).on('error', nay)
	.on('data', (data) => acc = reducer(acc, data))
	.on('end', () => yay(acc))
})

so(function* () {



	// console.info('Downloading GTFS data.')
	// yield new Promise((yay, nay) => {
	// 	const base = 'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/'
	// 	new Download({extract: true, mode: '755', strip: 1})
	// 	.get(base + 'routes.txt')
	// 	.get(base + 'calendar.txt')
	// 	.get(base + 'calendar_dates.txt')
	// 	.get(base + 'trips.txt')
	// 	.get(base + 'stop_times.txt')
	// 	.dest(dir).run((err) => {if (err) nay(err); else yay()})
	// })



	// console.info('Reading lines.')
	// const lines = yield readCsv('routes.txt', (acc, line) => {
	// 	line = {
	// 		  id:       parseInt(line.route_id)
	// 		, agencyId: parseAgency(line.agency_id)
	// 		, name:     line.route_short_name || line.route_long_name
	// 		, type:     lineTypes[line.route_type] || 'unknown'
	// 	}
	// 	acc[line.id] = line
	// 	return acc
	// }, {})



	console.info('Reading schedules.')
	let schedules = yield readCsv('calendar.txt', (acc, schedule) => {
		let days  = []
		const first = parseDate(schedule.start_date)
		const last  = parseDate(schedule.end_date)
		// assemble the list of days
		for (let i = 0; i < weekdays.length; i++) {
			if (parseInt(schedule[weekdays[i]]))
				days = days.concat(allDaysOfWeekday(first, last, i))
		}

		acc[parseInt(schedule.service_id)] =
			{id: parseInt(schedule.service_id), first, last, days}
		return acc
	}, {})

	schedules = yield readCsv('calendar_dates.txt', (acc, exception) => {
		const schedule = acc[parseInt(exception.service_id)]
		if (!schedule) return acc

		const date = parseDate(exception.date)
		const i = schedule.days.indexOf(date)
		if (parseInt(exception.exception_type) > 0) {
			if (i < 0) schedule.days.push(date)
		} else {
			if (i >= 0) schedule.days.splice(i, 1)
		}

		return acc
	}, schedules)



	console.info('Compressing schedules.')
	const scheduleIds = keyMap(Object.keys(schedules))

	for (let id1 in schedules) {
		const schedule1 = schedules[id1]
		for (let id2 in schedules) {
			const schedule2 = schedules[id2]
			if (schedule1.id === schedule2.id) continue

			if (equalDays(schedule1.days, schedule2.days)) {
				scheduleIds.map(schedule2.id, schedule1.id)
				delete schedules[schedule2.id]
				break
			}
		}
	}



	console.info('Reading trips.')
	let trips = yield readCsv('trips.txt', (acc, trip) => {
		trip = {
			  id:         parseInt(trip.trip_id)
			, lineId:     parseInt(trip.route_id)
			, scheduleId: scheduleIds.get(parseInt(trip.service_id))
			, name:       trip.trip_short_name || trip.trip_headsign
			, stops:      []
		}
		acc[trip.id] = trip
		return acc
	}, {})

	trips = yield readCsv('stop_times.txt', (acc, stop) => {
		const trip = acc[parseInt(stop.trip_id)]
		if (!trip) return acc

		trip.stops.push({
			  s: parseInt(stop.stop_id)
			, t: parseTime(stop.departure_time)
		})
		return acc
	}, trips)



	console.info('Normalizing trips.')
	for (let id in trips) {
		const trip = trips[id]

		trip.start = trip.stops[0]
		for (let stop of trip.stops) {stop.t -= trip.start}

		let signature = ''
		for (let stop of trip.stops) {signature += stop.s + stop.t}
		trip.signature = hash(signature)
	}



	console.info('Compressing trips.')
	const tripIds = keyMap(Object.keys(trips))

	for (let id1 in trips) {
		const trip1 = trips[id1]
		for (let id2 in trips) {
			const trip2 = trips[id2]
			if (trip1.id === trip2.id) continue

			if (trip1.scheduleId === trip2.scheduleId
			&&      trip1.lineId === trip2.lineId
			&&   trip1.signature === trip2.signature) {
				tripIds.map(trip2.id, trip1.id)
				console.log(trip2.id + '->' + trip1.id)
				delete trips[trip2.id]
				break
			}
		}
	}

	console.log(trips[tripIds.get(1)])

})()
.catch((err) => console.error(err.stack))
