'use strict'

const so       = require('so')
const lib      = require('./lib')



const readTrips = so(function* (scheduleIds) {



	let trips = yield lib.readCsv('trips.txt', (acc, trip) => {
		const scheduleId = parseInt(scheduleIds.get(parseInt(trip.service_id)))
		if (!scheduleId) console.error('Invalid service_id', trip.service_id)

		trip = {
			id: trip.trip_id,
			lineId: trip.route_id,
			shape: trip.shape_id,
			scheduleId,
			name: trip.trip_short_name || trip.trip_headsign,
			stops: [],
			start: null
		}
		acc[trip.id] = trip
		return acc
	}, {})

	trips = yield lib.readCsv('stop_times.txt', (acc, stop) => {
		const trip = acc[stop.trip_id]
		if (!trip) return acc

		const station = stop.stop_id
		const when    = lib.parseTime(stop.departure_time) / 1000

		if (trip.stops.length === 0) trip.start = when
		trip.stops.push({s: station, t: when - trip.start})
		return acc
	}, trips)



	return trips
})

module.exports = readTrips
