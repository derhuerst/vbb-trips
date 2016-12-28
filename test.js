'use strict'

const test = require('tape-catch')
const data = require('./index')



test('load single line', (t) => {
	t.plan(4)

	data.lines(true, '17525_400')
	.then((lines) => {
		const line = lines[0]
		t.ok(line, 'line does not exist')

		t.equal(line.id, '17525_400')
		t.equal(typeof line.name, 'string')
		t.equal(typeof line.type, 'string')
	})
	.catch(t.fail)
})

test('load multiple routes', (t) => {
	data.routes({lineId: '17525_400'})
	.on('data', (route) => {
		t.equal(route.lineId, '17525_400')
	})
	.on('end', () => t.end())
})
