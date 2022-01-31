'use strict'

const readTrips = async (readFile) => {
	const acc = Object.create(null) // by ID

	for await (const t of await readFile('trips')) {
		acc[t.trip_id] = {
			id: t.trip_id,
			lineId: t.route_id,
			serviceId: t.service_id,
			name: t.trip_short_name || t.trip_headsign
		}
	}

	return acc
}

module.exports = readTrips
