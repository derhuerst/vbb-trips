# vbb-trips 🚏

**Raw data about when VBB trains stop at which stations.** Computed from [open](http://daten.berlin.de/datensaetze/vbb-fahrplandaten-januar-2017-bis-dezember-2017) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://vbb-gtfs.jannisr.de/).

[![npm version](https://img.shields.io/npm/v/vbb-trips.svg)](https://www.npmjs.com/package/vbb-trips)
[![build status](https://img.shields.io/travis/derhuerst/vbb-trips.svg)](https://travis-ci.org/derhuerst/vbb-trips)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-trips.svg)](https://david-dm.org/derhuerst/vbb-trips)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-trips.svg)](https://david-dm.org/derhuerst/vbb-trips#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-trips.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

```shell
npm install vbb-trips
```


## Usage

```js
const data = require('vbb-trips')

data.lines(true, '17289_700').then(console.log) // query a single line
data.routes({lineId: '17289_700'}).on('data', console.log) // filter routes
```

A route looks like this:

```js
{
	lineId: '17289_700',
	stops: [ // milliseconds since departure at first stop
		{s: '070101006736', t: 0},
		{s: '070101007156', t: 120000},
		{s: '070101007309', t: 180000},
		{s: '070101005243', t: 240000},
		{s: '070101007160', t: 300000},
		// …
	],
	when: [ // these are timestamps of the first stop
		1485152520000,
		1485757320000,
		1486362120000,
		1486966920000,
		1487571720000,
		// …
	]
}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-trips/issues).
