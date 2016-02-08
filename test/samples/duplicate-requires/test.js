import * as assert from 'assert';

export default function test ( Component ) {
	const ractive = new Component();

	assert.equal( ractive.get( 'foo' ), 'FOO' );
	assert.equal( ractive.get( 'bar' ), 'BAR' );
}
