'use strict'

const so       = require('so')
const lib      = require('./lib')



const readLines = () => lib.readCsv('routes.txt', (acc, line) => {
	acc[line.route_id] = {
		type: 'line',
		id: line.route_id,
		operator: lib.parseAgency(line.agency_id),
		name: line.route_short_name || line.route_long_name,
		mode: lib.modes[line.route_type] || null,
		product: lib.products[line.route_type] || 'unknown',
		routes: {} // temporarily used, not written to disk
	}
	return acc
}, {})

module.exports = readLines
