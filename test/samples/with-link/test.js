import * as assert from 'assert';

export default function test ( Component ) {
	const ractive = new Component();

	assert.equal( ractive.toHTML(), '<h1>Main</h1> <h2>Foo</h2>' );
}
