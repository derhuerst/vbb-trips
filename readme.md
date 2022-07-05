# vbb-trips 🚏

**Raw data about when VBB trains stop at which stations.** Computed from [open](https://daten.berlin.de/datensaetze/vbb-fahrplandaten-gtfs) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://vbb-gtfs.jannisr.de/).

[![npm version](https://img.shields.io/npm/v/vbb-trips.svg)](https://www.npmjs.com/package/vbb-trips)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-trips.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install vbb-trips
```


## Usage

```js
const data = require('vbb-trips')
```

`data.lines([promise], [id])` and `data.schedules([promise], [id])` return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) if `promise` is `true`. Otherwise, they return a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) [in object mode](https://nodejs.org/api/stream.html#stream_object_mode).

### lines

```js
data.lines(true, '17289_700') // query a single line
.then(console.log, console.error)
```

This will give you `line` objects in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
[{
	type: 'line',
	id: '17289_700',
	operator: '796',
	name: '100',
	mode: 'bus',
	product: 'bus',
	weight: 392507
}]
```

### schedules

```
data.schedules()
.on('data', console.log)
.on('error', console.error)
```

This will give you `schedule` objects in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
{
	type: 'schedule',
	id: 'Z2txwLd',
	route: {
		type: 'route',
		id: 'Z2txwLd',
		line: '4221_700',
		stops: [
			'750000105901' // station IDs
			// …
		]
	},
	sequence: [
		{departure: 0}, // seconds since departure at first stop
		// …
	],
	starts: [
		1509978000 // Unix timestamp at the first stop
		// …
	]
}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-trips/issues).
