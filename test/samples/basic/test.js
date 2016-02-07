import * as assert from 'assert';

export default function test ( Component ) {
	const ractive = new Component({
		data: { name: 'world' }
	});

	assert.equal( ractive.toHTML(), '<h1>Hello world!</h1>' );
}
