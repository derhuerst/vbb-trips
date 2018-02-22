'use strict'

// todo: move into an npm lib
const modes = {
	100: 'train', 102: 'train', 109: 'train', 400: 'train',
	700: 'bus',
	900: 'tram',
	1000: 'ferry'
}

// todo: move into an npm lib
const products = {
	100: 'regional', 102: 'regional',
	109: 'suburban',
	400: 'subway',
	700: 'bus', 3: 'bus',
	900: 'tram',
	1000: 'ferry'
}

module.exports = {
	modes, products
}
