'use strict'

// This build script tries to reduce the amount of implicitly redundant data, coming from the GTFS dumps.
// - calendar.txt and calendar_dates.txt get merged. For each schedule, only a list of days (on which they are valid) is kept.
// - trips.txt and stop_time.txt get merged. Because relative travel times are used, a lot of now redundant trips can be removed.

const so       = require('so')
const keyMap   = require('key-map')
const hash     = require('shorthash').unique
const pick     = require('lodash.pick')
const uniq = require('lodash.uniq')
const arrEqual = require('array-equal')
const fs       = require('fs-promise')
const path     = require('path')
const weights = require('vbb-mode-weights')

const lib           = require('./lib')
const readLines     = require('./read-lines')
const readSchedules = require('./read-schedules')
const readTrips     = require('./read-trips')

const dir = path.join(__dirname, 'data')

so(function* () {

	console.info('Reading lines.')
	const lines = yield readLines()

	console.info('Reading schedules.')
	let schedules = yield readSchedules()
	const scheduleIds = keyMap(Object.keys(schedules))

	for (let id1 in schedules) {
		const schedule1 = schedules[id1]
		for (let id2 in schedules) {
			const schedule2 = schedules[id2]
			if (schedule1.id === schedule2.id) continue

			if (arrEqual(schedule1.days, schedule2.days)) {
				console.info(schedule2.id + ' -> ' + schedule1.id)
				scheduleIds.map(schedule2.id, schedule1.id)
				delete schedules[schedule2.id]
				break
			}
		}
	}



	console.info('Reading trips.')
	let trips = yield readTrips(scheduleIds)

	console.info('Reducing trips into lines.')
	for (let id in trips) {
		const trip = trips[id]
		const line = lines[trip.lineId]
		if (!line) {
			console.warn(`line ${trip.lineId} for trip ${id} does not exist`)
			continue
		}
		const schedule = schedules[scheduleIds.get(trip.scheduleId)]
		if (!schedule) {
			console.warn(`schedule ${trip.scheduleId} for trip ${id} does not exist`)
			continue
		}

		const signature = hash(line.id + trip.stops.map((stop) => stop.s + ',' + stop.t).join(';'))

		if (!line.routes[signature]) {
			line.routes[signature] = {
				type: 'schedule',
				id: signature,
				route: {
					type: 'route',
					id: signature,
					line: line.id,
					stops: trip.stops.map((stop) => stop.s)
				},
				sequence: trip.stops.map((stop) => ({departure: stop.t})),
				starts: [],
				shape: trip.shape
			}
		}

		line.routes[signature].starts = line.routes[signature].starts
			.concat(schedule.days.map((day) => day + trip.start))

		delete trips[trip.id]
	}



	console.info('Computing line weights.')
	for (let id in lines) {
		const line = lines[id]
		line.weight = 0

		for (let signature in line.routes) {
			const schedule = line.routes[signature]
			const starts = schedule.starts.length

			for (let stop of schedule.sequence) {
				if (stop.arrival) line.weight += starts
				if (stop.departure) line.weight += starts
			}
		}

		line.weight = Math.round(line.weight * weights[line.product])
	}



	console.info('Writing lines.')
	let dest = lib.writeNdjson('lines.ndjson')
	for (let id in lines) {
		const line = lines[id]
		dest.write(pick(line, [
			'type', 'id', 'operator', 'name', 'mode', 'product', 'weight'
		]))
	}
	dest.end()



	console.info('Writing schedules.')
	dest = lib.writeNdjson('schedules.ndjson')
	for (let lineId in lines) {
		const line = lines[lineId]
		for (let signature in line.routes) {
			const sched = line.routes[signature]
			sched.starts = uniq(sched.starts) // todo: why are there duplicates?
			dest.write(sched)
		}
	}
	dest.end()

})()
.catch((err) => console.error(err.stack))
