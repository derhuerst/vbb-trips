'use strict'

const readTrips = (readFile) => {
	const acc = Object.create(null) // by ID
	const onTrip = (t) => {
		acc[t.trip_id] = {
			id: t.trip_id,
			lineId: t.route_id,
			serviceId: t.service_id,
			name: t.trip_short_name || t.trip_headsign
		}
	}

	const trips = readFile('trips')
	trips.on('data', onTrip)

	return new Promise((resolve, reject) => {
		trips.once('error', err => trips.destroy(err))
		trips.once('end', (err) => {
			if (err) reject(err)
			else setImmediate(resolve, acc)
		})
	})
}

module.exports = readTrips
