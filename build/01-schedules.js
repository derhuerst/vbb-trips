'use strict'

const got   = require('got')
const csv   = require('csv-parse')
const sink  = require('stream-sink')
const parse = require('cli-native')
const so    = require('so')
const uniq  = require('lodash.uniq')
const diff  = require('lodash.difference')
const path  = require('path')
const fsP   = require('fs-promise')



const download = (url) => new Promise((yay, nay) => {
	got.stream(url).on('error', nay)
	.pipe(csv({columns: true})).on('error', nay)
	.pipe(sink({objectMode: true})).on('error', nay)
	.on('data', yay)
})

const parseDate = (date) => new Date([
	  date.substr(0,4)
	, date.substr(4,2)
	, date.substr(6,2)
].join('-'))

const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const dayOf = (date) => daysOfWeek[date.getDay()]
const millisecondsInADay = 1000 * 60 * 60 * 24



so(function* () {

	let _ = yield download(
		'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/calendar.txt')

	const schedules = {}
	for (let data of _) {
		let id = parseInt(data.service_id)
		schedules[id] = {
			  id
			, start: parseDate(data.start_date).valueOf()
			, end:   parseDate(data.end_date).valueOf()
			, sun:   {default: !!parse.to(data.sunday),    except: []}
			, mon:   {default: !!parse.to(data.monday),    except: []}
			, tue:   {default: !!parse.to(data.tuesday),   except: []}
			, wed:   {default: !!parse.to(data.wednesday), except: []}
			, thu:   {default: !!parse.to(data.thursday),  except: []}
			, fri:   {default: !!parse.to(data.friday),    except: []}
			, sat:   {default: !!parse.to(data.saturday),  except: []}
		}
	}



	_ = yield download(
		'https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/calendar_dates.txt')

	for (let data of _) {
		const id = parseInt(data.service_id)
		if (!(id in schedules)) {
			console.error(`There is no schedule ${id}.`)
			continue
		}
		const schedule = schedules[id]
		const date  = parseDate(data.date).valueOf()
		const day  = dayOf(parseDate(data.date))
		const type = parseInt(data.exception_type)

		if (type !== 1 && type !== 2) {
			console.error(`Invalid exception type ${type}.`)
			continue
		}

		if ((type === 1 && schedule[day].default === false)
	    ||  (type === 2 && schedule[day].default === true ))
			if (schedule[day].except.indexOf(date) < 0)
				schedule[day].except.push(date)
	}



	let validFrom = Infinity, validUntil = -Infinity
	for (let data of _) {
		const date  = parseDate(data.date).valueOf()
		if (date < validFrom)  validFrom = date
		if (date > validUntil) validUntil = date
	}
	console.info(`Data is valid from ${new Date(validFrom)}.`)
	console.info(`Data is valid until ${new Date(validUntil)}.`)



	const datesByDay = {sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []}
	let ms = validFrom
	while (ms <= validUntil) {
		const date = new Date(ms)
		datesByDay[dayOf(date)].push(ms)
		ms += millisecondsInADay
	}

	for (let id in schedules) {
		const schedule = schedules[id]
		for (let day of daysOfWeek) {
			const d = schedule[day]
			const all = datesByDay[day]
			d.except = uniq(d.except)
			if (d.except.length > (all.length / 2)) {
				d.default = !d.default
				d.except = diff(all, d.except)
			}
		}
	}

	// write data
	const file = path.join(__dirname, 'schedules.json')
	yield fsP.writeFile(file, JSON.stringify(schedules))
	console.log('Done.')

})()
.catch((err) => {
	console.error(err.stack)
	process.exit(1)
})
