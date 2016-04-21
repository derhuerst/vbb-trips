'use strict'

const ndjson       = require('ndjson')
const filterStream = require('stream-filter')
const fs           = require('fs')
const path         = require('path')
const sink         = require('stream-sink')



const filterById = (id) => (data) => data && data.id === id

const filterByKeys = (pattern) => (data) => {
	if (!data) return false
	for (let key in pattern) {
		if (!data.hasOwnProperty(key)) return false
		if (data[key] !== pattern[key]) return false
	}
	return true
}



const base = path.join(__dirname, 'data')

const selector = (file) => function (/* promised, pattern */) {
	const args = Array.prototype.slice.call(arguments)
	let   pattern = args.pop()
	let   promised = !!args.shift()

	const reader = fs.createReadStream(path.join(base, file))
	const parser = reader.pipe(ndjson.parse())
	let filter

	if (pattern === 'all' || pattern === undefined)
		filter = parser // no filter
	else if ('number' === typeof pattern)
		filter = parser.pipe(filterStream(filterById(pattern)))
	else filter = parser.pipe(filterStream(filterByKeys(pattern)))

	if (promised === true) return new Promise((yay, nay) => {
		reader.on('error', nay)
		parser.on('error', nay)
		filter.on('error', nay)

		filter.pipe(sink({objectMode: true}))
		.on('error', nay).on('data', yay)
	})
	else return filter
}

const lines  = selector('lines.ndjson')
const routes = selector('routes.ndjson')



module.exports = {filterById, filterByKeys, lines, routes}
