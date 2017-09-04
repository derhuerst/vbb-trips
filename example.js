'use strict'

const data = require('.')

data.schedules('all')
.on('data', (sched) => {
	console.log(sched.id)
})
.on('error', console.error)
