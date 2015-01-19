# rcu-builders

Utilities to convert Ractive component files into JavaScript modules. This is designed to be used by [component loaders](https://github.com/ractivejs/component-spec/blob/master/implementers.md) such as [gobble-ractive](https://github.com/gobblejs/gobble-ractive) - unless you're creating a component loader, this probably isn't what you're looking for.

## Installation

```bash
npm i rcu-builders
```

## Usage

```js
var rcu = require( 'rcu' );
var builders = require( 'rcu-builders' );
var Ractive = require( 'ractive' );

// Initialise ractive component utils
rcu.init( Ractive );

module.exports = function createModule ( source ) {
	var definition = rcu.parse( source );

	// there are three builders - AMD, CommonJS, ES6
	var amdModule = builders.amd( definition );
	var cjsModule = builders.cjs( definition );
	var es6Module = builders.es6( definition );

	// ...
}
```

## Building

```bash
npm run build
```

This will create `dist/rcu-builders.js`.

## License

MIT. Copyright 2015 Rich Harris