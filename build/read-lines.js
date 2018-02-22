'use strict'

const {parseAgency, modes, products} = require('./lib')

const readLines = (readFile) => {
	const acc = Object.create(null) // by ID
	const onLine = (l) => {
		acc[l.route_id] = {
			type: 'line',
			id: l.route_id,
			operator: parseAgency(l.agency_id),
			name: l.route_short_name || l.route_long_name,
			mode: modes[l.route_type] || null,
			product: products[l.route_type] || 'unknown',
			weight: 0 // accumulated to later
		}
		if (acc[l.route_id].product === 'unknown') console.error(l.route_type)
	}

	const lines = readFile('routes')
	lines.on('data', onLine)

	return new Promise((resolve, reject) => {
		lines.once('error', err => lines.destroy(err))
		lines.once('end', (err) => {
			if (err) reject(err)
			else setImmediate(resolve, acc)
		})
	})
}

module.exports = readLines
