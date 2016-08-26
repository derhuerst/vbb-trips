# vbb-trips 🚏

**Raw data about when VBB trains stop at which stations.**

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

data.lines(true, 1).then(console.log) // query a single line
data.routes({lineId: 1}).on('data', console.log) // filter routes
```

A route looks like this:

```js
{
	lineId: 1,
	stops: [ // milliseconds since departure at first stop
		{s: 9230999, t: 0},
		{s: 9230400, t: 360000},
		{s: 9220019, t: 840000},
		{s: 9220070, t: 1260000},
		{s: 9220114, t: 1560000},
		{s: 9220001, t: 1680000},
		{s: 9260024, t: 2820000}
	],
	when: [ // these are timestamps of the first stop
		1458791100000,
		1459219500000,
		1459305900000,
		…
		1481082300000,
		1481168700000,
		1481255100000
	]
}
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-trips/issues).
