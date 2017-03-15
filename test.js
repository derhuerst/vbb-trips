'use strict'

const test = require('tape-catch')
const filter = require('stream-filter')

const data = require('.')

const assertValidTimestamp = (test, t) => {
	test.equal(typeof t, 'number')
	test.ok(t > 1400000000, 'timestamp seems to be too small')
}



test('load single line', (t) => {
	t.plan(3)

	data.lines(true, '17525_400')
	.then((lines) => {
		const line = lines.find((line) => line.id === '17525_400')
		t.ok(line, 'line does not exist')

		t.equal(typeof line.name, 'string')
		t.equal(typeof line.type, 'string')
		// todo
		// t.equal(typeof line.shapeId, 'string')
	})
	.catch(t.fail)
})

test('load multiple schedules', (t) => {
	data.schedules()
	.pipe(filter.obj((sched) => sched.route.line === '17525_400'))
	.on('data', (sched) => {
		const route = sched.route

		t.ok(Array.isArray(route.stops), 'stops is not an array')
		for (let stop of route.stops) t.equal(typeof stop, 'string')

		t.ok(Array.isArray(sched.starts), 'starts is not an array')
		for (let ts of sched.starts) assertValidTimestamp(t, ts)

		t.ok(Array.isArray(sched.sequence), 'sequence is not an array')
		for (let item of sched.sequence) {
			t.equal(typeof item.departure, 'number')
			if ('arrival' in item) t.equal(typeof item.arrival, 'number')
		}

		t.equal(typeof sched.shape, 'string')
		t.ok(sched.shape)
	})
	.on('end', () => t.end())
})
