'use strict'

// This build script tries to reduce the amount of implicitly redundant data, coming from the GTFS dumps.
// - calendar.txt and calendar_dates.txt get merged. For each schedule, only a list of days (on which they are valid) is kept.
// - trips.txt and stop_time.txt get merged. Because relative travel times are used, a lot of now redundant trips can be removed.

const so       = require('so')
const Download = require('download')
const keyMap   = require('key-map')
const hash     = require('shorthash').unique

const lib      = require('./lib')
const readSchedules = require('./schedules')

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



	console.info('Reading lines.')
	const lines = yield lib.readCsv('routes.txt', (acc, line) => {
		line = {
			  id:       parseInt(line.route_id)
			, agencyId: lib.parseAgency(line.agency_id)
			, name:     line.route_short_name || line.route_long_name
			, type:     lib.lineTypes[line.route_type] || 'unknown'
			, variants: {}
		}
		acc[line.id] = line
		return acc
	}, {})



	console.info('Reading schedules.')
	let schedules = yield readSchedules()



	console.info('Compressing schedules.')
	const scheduleIds = keyMap(Object.keys(schedules))

	for (let id1 in schedules) {
		const schedule1 = schedules[id1]
		for (let id2 in schedules) {
			const schedule2 = schedules[id2]
			if (schedule1.id === schedule2.id) continue

			if (lib.equalListsOfDays(schedule1.days, schedule2.days)) {
				scheduleIds.map(schedule2.id, schedule1.id)
				delete schedules[schedule2.id]
				break
			}
		}
	}



	console.info('Reading trips.')
	let trips = yield lib.readCsv('trips.txt', (acc, trip) => {
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

	trips = yield lib.readCsv('stop_times.txt', (acc, stop) => {
		const trip = acc[parseInt(stop.trip_id)]
		if (!trip) return acc

		trip.stops.push({
			  s: parseInt(stop.stop_id)
			, t: lib.parseTime(stop.departure_time)
		})
		return acc
	}, trips)


	console.info('Normalizing trips.')
	for (let id in trips) {
		const trip = trips[id]

		trip.start = trip.stops[0].t
		for (let stop of trip.stops) {stop.t -= trip.start}

		let signature = ''
		for (let stop of trip.stops) {signature += stop.s + stop.t}
		trip.signature = hash(signature)
	}



	console.info('Compressing trips.')
	const tripIds = keyMap(Object.keys(trips))

	const tripsByHash = {}
	for (let id in trips) {
		const trip = trips[id]

		let signature = ''
		for (let stop of trip.stops) {signature += stop.s + stop.t}

		let duplicate
		if (signature in tripsByHash) {
			duplicate = tripsByHash[signature]
			tripIds.map(trip.id, duplicate.id)
			delete trips[trip.id]
		} else tripsByHash[signature] = trip

		console.log(!!lines[trip.lineId])
	}

})()
.catch((err) => console.error(err.stack))
