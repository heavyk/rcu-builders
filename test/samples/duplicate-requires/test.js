import * as assert from 'assert';

export default function test ( Component ) {
	const ractive = new Component();

	assert.equal( ractive.get( 'foo' ), 'FOO' );
	assert.equal( ractive.get( 'bar' ), 'BAR' );
	assert.equal( ractive.get( 'baz' ), 'BAZ' );
	assert.equal( ractive.get( 'x' ), require( __dirname + '/x' ) );
	assert.equal( ractive.decorators.deco, require( __dirname + '/x' ) );
	assert.equal( ractive.decorators.ration, require( __dirname + '/y' ) );
}
