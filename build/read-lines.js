'use strict'

const so       = require('so')
const lib      = require('./lib')



const readLines = () => lib.readCsv('routes.txt', (acc, line) => {
	line = {
		  id:       line.route_id
		, agencyId: lib.parseAgency(line.agency_id)
		, name:     line.route_short_name || line.route_long_name
		, type:     lib.lineTypes[line.route_type] || 'unknown'
		, routes:   {}
	}
	acc[line.id] = line
	return acc
}, {})

module.exports = readLines
