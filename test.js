'use strict'

const test = require('tape-catch')
const data = require('./index')



test('load single line', (t) => {
	t.plan(3)

	data.lines(true, 1)
	.then((lines) => {
		const line = lines[0]

		t.equal(line.id, 1)
		t.equal(typeof line.name, 'string')
		t.equal(typeof line.type, 'string')
	})
})

test('load multiple routes', (t) => {
	data.routes({lineId: 1})
	.on('data', (route) => {
		t.equal(route.lineId, 1)
	})
	.on('end', () => t.end())
})
