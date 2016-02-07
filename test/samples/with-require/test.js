import * as assert from 'assert';

export default function test ( Component ) {
	const ractive = new Component();

	assert.equal( ractive.toHTML(), '<p>foo: FOO</p>' );
}
