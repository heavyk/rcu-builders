import createBody from '../utils/createBody';
import deprecateToString from '../utils/deprecateToString';

export default function cjs ( definition ) {
	const { intro, body, outro } = createBody( definition );

	let requireStatements = definition.imports.map( function ( imported, i ) {
		var path = imported.href.replace( /\.[a-zA-Z]+$/, '' );
		return `__import${i}__ = require('${path}')`;
	});

	requireStatements.unshift( `Ractive = require('ractive')` );

	const code = 'var ' + requireStatements.join( ',\n\t' ) + ';\n\n' +
	intro +
	body +
	outro +
	'module.exports = __export__;';

	// TODO sourcemap support

	return deprecateToString( code, null, 'cjs' );
}
