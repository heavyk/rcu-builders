/*global require */
import * as sander from 'sander';
import * as path from 'path';
import nodeResolve from 'resolve';
import Ractive from 'ractive';
import { init, parse, resolve } from 'rcu';
import { describe, it } from 'mocha';
import { amd, cjs, es6 } from '..';

init( Ractive );

describe( 'rcu-builders', () => {
	const samples = sander.readdirSync( 'test/samples' )
		.filter( dir => dir[0] !== '.' )
		.map( dir => {
			return {
				title: dir,
				entry: path.resolve( 'test/samples', dir, 'Component.html' ),
				test: require( `./samples/${dir}/test.js` ).default
			};
		});

	describe( 'cjs', () => {
		let components = {};

		function load ( file ) {
			return sander.readFile( file, { encoding: 'utf-8' })
				.then( source => parse( source ) )
				.then( definition => {
					const importPromises = definition.imports.map( ({ href }) => {
						const resolved = resolve( href, file );

						return load( resolved ).then( Component => {
							components[ resolved ] = Component;
						});
					});

					return Promise.all( importPromises )
						.then( () => {
							const { code } = cjs( definition );

							const fn = new Function( 'module', 'exports', 'require', code );

							function req ( relativePath ) {
								let resolved = resolve( relativePath, file ) + '.html';

								if ( components[ resolved ] ) return components[ resolved ];

								resolved = nodeResolve.sync( relativePath, {
									base: path.dirname( file )
								});

								return require( resolved );
							}

							let module = { exports: {} };
							fn( module, module.exports, req );

							return module.exports;
						});
				});
		}

		samples.forEach( sample => {
			it( sample.title, () => {
				return load( sample.entry ).then( sample.test );
			});
		});
	});
});
