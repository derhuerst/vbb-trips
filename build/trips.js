'use strict'

const so       = require('so')
const lib      = require('./lib')



const trips = so(function* (scheduleIds) {



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

		const station = parseInt(stop.stop_id)
		const when    = lib.parseTime(stop.departure_time)

		if (trip.stops.length === 0) trip.start = when
		trip.stops.push({s: station, t: when - trip.start})
		return acc
	}, trips)



	return trips
})

module.exports = trips
