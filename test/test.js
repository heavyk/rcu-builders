/*global require */
import * as sander from 'sander';
import * as path from 'path';
import * as assert from 'assert';
import nodeResolve from 'resolve';
import { transform } from 'babel-core';
import { SourceMapConsumer } from 'source-map';
import Ractive from 'ractive';
import { init, parse, resolve } from 'rcu';
import { describe, it } from 'mocha';
import getLocation from './utils/getLocation.js';
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

	sander.rimrafSync( 'test/output' );

	describe( 'amd', () => {
		function load ( file ) {
			return sander.readFile( file, { encoding: 'utf-8' })
				.then( source => parse( source ) )
				.then( definition => {
					const { code } = amd( definition );

					sander.writeFileSync( file.replace( 'samples', 'output/amd' ).replace( '.html', '.js' ), code );

					return new Promise( fulfil => {
						function req ( relativePath ) {
							const resolved = nodeResolve.sync( relativePath, {
								basedir: path.dirname( file )
							});

							return require( resolved );
						}

						function define ( deps, callback ) {
							const promises = deps.map( relativePath => {
								if ( relativePath === 'require' ) {
									return Promise.resolve( req );
								}

								let resolved;

								try {
									resolved = nodeResolve.sync( relativePath, {
										basedir: path.dirname( file )
									});

									return require( resolved );
								} catch ( err ) {
									resolved = resolve( relativePath, file ) + '.html';
									return load( resolved );
								}
							});

							return Promise.all( promises )
								.then( values => callback.apply( null, values ) )
								.then( fulfil );
						}

						const fn = new Function( 'define', code );
						fn( define );
					});
				});
		}

		samples.forEach( sample => {
			it( `executes ${sample.title}`, () => {
				return load( sample.entry ).then( sample.test );
			});
		});
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

							sander.writeFileSync( file.replace( 'samples', 'output/cjs' ).replace( '.html', '.js' ), code );

							const fn = new Function( 'module', 'exports', 'require', code );

							function req ( relativePath ) {
								let resolved = resolve( relativePath, file ) + '.html';

								if ( components[ resolved ] ) return components[ resolved ];

								resolved = nodeResolve.sync( relativePath, {
									basedir: path.dirname( file )
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
			it( `executes ${sample.title}`, () => {
				return load( sample.entry ).then( sample.test );
			});
		});
	});

	describe( 'es', () => {
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
							let { code } = es6( definition );

							sander.writeFileSync( file.replace( 'samples', 'output/es' ).replace( '.html', '.js' ), code );

							code = transform( code, {
								presets: [ 'es2015' ],
								babelrc: false
							}).code;

							const fn = new Function( 'module', 'exports', 'require', code );

							function req ( relativePath ) {
								let resolved = resolve( relativePath, file ) + '.html';

								if ( components[ resolved ] ) return components[ resolved ];

								resolved = nodeResolve.sync( relativePath, {
									basedir: path.dirname( file )
								});

								return require( resolved );
							}

							let module = { exports: {} };
							fn( module, module.exports, req );

							return module.exports.default;
						});
				});
		}

		samples.forEach( sample => {
			it( `executes ${sample.title}`, () => {
				return load( sample.entry ).then( sample.test );
			});
		});

		it( 'generates a sourcemap', () => {
			const source = `
<p>template</p>
<p>template</p>
<p>template</p>
<p>template</p>
<p>template</p>

<script>
	console.log( 42 );
</script>
`.slice( 1 );

			const definition = parse( source );
			const { code, map } = es6( definition, {
				sourceMap: true,
				sourceMapFile: 'Test.js',
				sourceMapSource: 'Test.html'
			});

			const generatedLoc = getLocation( code, code.indexOf( 'log' ) );

			const smc = new SourceMapConsumer( map );

			const actualLoc = smc.originalPositionFor( generatedLoc );
			const expectedLoc = getLocation( source, source.indexOf( 'log' ) );

			assert.equal( actualLoc.line, expectedLoc.line );
			assert.equal( actualLoc.column, expectedLoc.column );
		});
	});
});
