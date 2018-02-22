'use strict'

// This build script tries to reduce the amount of implicitly redundant
// data in the GTFS dumps.
// - calendar.txt and calendar_dates.txt get merged. For each service,
//   only a list of days (on which they are valid) is kept.
// - trips.txt and stop_time.txt get merged. Because relative travel
//   times are used, a lot of now redundant trips can be removed.

const path = require('path')
const readCsv = require('gtfs-utils/read-csv')
const so = require('so')
const readServices = require('gtfs-utils/read-services-and-exceptions')
const computeSchedules = require('gtfs-utils/compute-schedules')
const modeWeights = require('vbb-mode-weights')
const ndjson = require('ndjson')
const fs = require('fs')

const readLines = require('./read-lines')
const readTrips = require('./read-trips')

const srcDir = path.join(__dirname, 'data')
const destDir = path.join(__dirname, '..', 'data')

const readFile = file => readCsv(path.join(srcDir, file + '.txt'))

const TIMEZONE = 'Europe/Berlin'

const unknownErr = (itemType, itemId, refType, refId) => {
	return `unknwon ${itemType} '${itemId}' in ${refType} '${refId}'.`
}

const waitForFinish = (writable) => new Promise((resolve, reject) => {
	writable.once('error', err => writable.destroy(err))
	writable.once('end', (err) => {
		if (err) reject(err)
		else setTimeout(resolve, 0)
	})
})

const roundTo = (v, p) => parseFloat(v.toFixed(p))

so(function* () { // todo: async/await
	console.info('Reading lines.')
	const lines = yield readLines(readFile)

	console.info('Reading trips.')
	let trips = yield readTrips(readFile)

	console.info('Reading services.')
	const services = yield readServices(readFile, TIMEZONE)

	console.info('Computing schedules.')
	const schedules = yield computeSchedules(readFile)

	console.info('Computing line weights.')
	for (let signature in schedules) {
		const sched = schedules[signature]

		let scheduleWeight = 0
		for (let arr of sched.arrivals) {
			if ('number' === typeof arr) scheduleWeight++
		}
		for (let dep of sched.departures) {
			if ('number' === typeof dep) scheduleWeight++
		}

		for (let ref of sched.trips) {
			const trip = trips[ref.tripId]
			if (!trip) {
				console.error(unknownErr('trip', ref.tripId, 'schedule', sched.id))
				continue
			}
			const line = lines[trip.lineId]
			if (!line) {
				console.error(unknownErr('line', trip.lineId, 'trip', trip.id))
				continue
			}
			const service = services[trip.serviceId]
			if (!service) {
				console.error(unknownErr('service', trip.serviceId, 'trip', trip.id))
				continue
			}
			const modeWeight = modeWeights[line.product]
			if ('number' !== typeof modeWeight) {
				console.error(unknownErr('product', line.product, 'line', line.id))
				continue
			}

			// for each day in the service
			// for each arrival/departure in the schedule
			line.weight += service.length * scheduleWeight * modeWeight
		}
	}
})()
.catch((err) => {
	console.error(err)
	process.exitCode = 1
})
