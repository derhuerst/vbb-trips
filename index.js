'use strict'

const ndjson    = require('ndjson')
const filter    = require('stream-filter')
const fs        = require('fs')
const path      = require('path')
const map       = require('through2-map')



const filterById = (id) => (data) => data && data.id === id

const filterByKeys = (pattern) => (data) => {
	if (!data) return false
	for (let key in pattern) {
		if (!data.hasOwnProperty(key)) return false
		if (data[key] !== pattern[key]) return false
	}
	return true
}

const toPromise = (stream) => new Promise((yay, nay) => {
	const acc = []
	stream.on('error', nay)
	.on('data', (data) => acc.push(data))
	.on('end', () => yay(acc))
})

const decompress = (route) => {
	if (!Array.isArray(route.when)) return route
	for (let i = 0; i < route.when.length; i++) {
		route.when[i] *= 1000 // decompress
	}
	return route
}



const base = path.join(__dirname, 'data')

const selector = (file) => function (/* promised, pattern */) {
	const args = Array.prototype.slice.call(arguments)
	let   pattern = args.pop()
	let   promised = !!args.shift()

	let stream = fs.createReadStream(path.join(base, file))
	.pipe(ndjson.parse()).pipe(map.obj(decompress))

	if ('number' === typeof pattern)
		stream = stream.pipe(filter(filterById(pattern)))
	else if (pattern && pattern !== 'all')
		stream = stream.pipe(filter(filterByKeys(pattern)))

	if (promised === true) return toPromise(stream)
	else return stream
}

const lines  = selector('lines.ndjson')
const routes = selector('routes.ndjson')



module.exports = {filterById, filterByKeys, lines, routes}
