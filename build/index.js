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
const shorthash = require('shorthash').unique
const ndjson = require('ndjson')
const fs = require('fs')
// const uniq = require('lodash.uniq') // todo

const readLines = require('./read-lines')
const readTrips = require('./read-trips')
// const lib           = require('./lib')

const srcDir = path.join(__dirname, 'data')
const destDir = path.join(__dirname, '..', 'data')

const readFile = file => readCsv(path.join(srcDir, file + '.txt'))

const TIMEZONE = 'Europe/Berlin'

const unknownErr = (itemType, itemId, refType, refId) => {
	return `unknwon ${itemType} '${itemId}' in ${refType} '${refId}'.`
}

const waitForFinish = (writable) => new Promise((resolve, reject) => {
	writable.once('error', err => writable.destroy(err))
	writable.once('finish', (err) => {
		if (err) reject(err)
		else setTimeout(resolve, 0)
	})
})

const roundTo = (v, p) => parseFloat(v.toFixed(p))

so(function* () { // todo: async/await
	console.info('Reading lines, trips and services.')
	const lines = yield readLines(readFile)
	let trips = yield readTrips(readFile)
	const services = yield readServices(readFile, TIMEZONE)

	console.info('Computing schedules.')
	const schedules = yield computeSchedules(readFile)
	const routeSchedules = Object.create(null)

	console.info('Computing per-route schedules & line weights.')
	let i = 0
	for (let signature in schedules) {
		i++
		if (i % 100 === 0) console.error('.')
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

			const routeId = shorthash([
				sched.id, // prevent two schedules per route
				line.id, // prevent two lines per route
				...sched.stops
			].join('\xff'))
			let routeSchedule = routeSchedules[routeId]
			if (routeSchedule) {
				for (let day of service) {
					const t = day + ref.start
					if (!routeSchedule.starts.includes(t)) {
						routeSchedule.starts.push(t)
					}
				}
			} else {
				routeSchedule = routeSchedules[routeId] = {
					id: sched.id,
					route: {
						type: 'route',
						id: routeId,
						line: line.id,
						stops: sched.stops
					},
					sequence: [],
					starts: service.map(day => day + ref.start)
				}
				for (let i = 0; i < sched.arrivals.length; i++) {
					routeSchedule.sequence.push({
						departure: sched.departures[i],
						arrival: sched.arrivals[i]
					})
				}
			}
		}
	}

	console.info('Writing lines.')
	let convert = ndjson.stringify()
	let dest = fs.createWriteStream(path.join(destDir, 'lines.ndjson'))
	convert.pipe(dest)

	for (let id in lines) {
		const line = lines[id]
		line.weight = roundTo(line.weight, 6 - Math.log10(line.weight) | 0)
		convert.write(line)
	}
	convert.end()
	yield waitForFinish(dest)

	console.info('Writing schedules.')
	convert = ndjson.stringify()
	dest = fs.createWriteStream(path.join(destDir, 'schedules.ndjson'))
	convert.pipe(dest)

	for (let signature in routeSchedules) {
		convert.write(routeSchedules[signature])
	}
	convert.end()
	yield waitForFinish(dest)
})()
.catch((err) => {
	console.error(err)
	process.exitCode = 1
})
