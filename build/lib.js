'use strict'

const moment   = require('moment')
const path     = require('path')
const fs       = require('fs')
const csv      = require('csv-parse')
const ndjson   = require('ndjson')



const parseAgency = (agency) => agency.replace(/[^a-zA-Z0-9]+$/, '')

const lineTypes = {
	  100:	'regional'
	, 102:	'regional'
	, 109:	'suburban'
	, 400:	'subway'
	, 700:	'bus'
	, 900:	'tram'
	, 1000:	'ferry'
}



const parseDate = (date) => moment([
	  date.substr(0, 4)
	, date.substr(4, 2)
	, date.substr(6, 2)
].join('-')).valueOf()

const parseTime = (time) => moment.duration(time).asMilliseconds()

const day = 24 * 60 * 60 * 1000
const daysBetween = (first, last) => {
	const days = []
	for (let i = first; i <= last; i += day) {days.push(i)}
	return days
}

const equalListsOfDays = (a, b) => {
	for (let i = 0; i < a.length; i++)
		{if (a[i] !== b[i]) return false}
	return true
}

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const isWeekday = (weekday) => (day) =>
	new Date(day).getDay() === weekday

const allDaysOfWeekday = (first, last, weekday) =>
	daysBetween(first, last).filter(isWeekday(weekday))



const dir = path.join(__dirname, 'data')

const readCsv = (file, reducer, acc) => new Promise((yay, nay) => {
	fs.createReadStream(path.join(dir, file))
	.pipe(csv({columns: true})).on('error', nay)
	.on('data', (data) => acc = reducer(acc, data))
	.on('end', () => yay(acc))
})

const writeNdjson = (file) => {
	const s = ndjson.stringify()
	s.pipe(fs.createWriteStream(path.join(__dirname, '../data', file)))
	return s
}



module.exports = {
	parseAgency, lineTypes,
	parseDate, parseTime, daysBetween, equalListsOfDays,
	weekdays, isWeekday, allDaysOfWeekday,
	readCsv, writeNdjson
}
