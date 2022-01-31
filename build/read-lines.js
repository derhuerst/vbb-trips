'use strict'

const {gtfsToFptf} = require('gtfs-utils/route-types')
const {products} = require('./lib')

const parseAgency = (agency) => agency.replace(/[^a-zA-Z0-9]+$/, '')

const readLines = async (readFile) => {
	const acc = Object.create(null) // by ID

	for await (const l of await readFile('routes')) {
		acc[l.route_id] = {
			type: 'line',
			id: l.route_id,
			operator: parseAgency(l.agency_id),
			name: l.route_short_name || l.route_long_name,
			mode: gtfsToFptf(l.route_type),
			product: products[l.route_type] || 'unknown',
			weight: 0 // accumulated to later
		}
		if (acc[l.route_id].product === 'unknown') console.error(l.route_type)
	}

	return acc
}

module.exports = readLines
