'use strict'

const so       = require('so')
const lib      = require('./lib')



const lines = () => lib.readCsv('routes.txt', (acc, line) => {
	line = {
		  id:       parseInt(line.route_id)
		, agencyId: lib.parseAgency(line.agency_id)
		, name:     line.route_short_name || line.route_long_name
		, type:     lib.lineTypes[line.route_type] || 'unknown'
		, variants: {}
	}
	acc[line.id] = line
	return acc
}, {})

module.exports = lines
