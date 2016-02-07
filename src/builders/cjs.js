import createBody from '../utils/createBody';
import deprecateToString from '../utils/deprecateToString';

export default function cjs ( definition ) {
	const body = createBody( definition, 'module.exports =' );

	const requires = definition.imports.map( ( imported, i ) => {
		var path = imported.href.replace( /\.[a-zA-Z]+$/, '' );
		return `var __import${i}__ = require('${path}');`;
	});

	const code = `
var Ractive = require('ractive');
${requires.join( '\n' )}

${body}`.slice( 1 );

	// TODO sourcemap support

	return deprecateToString( code, null, 'cjs' );
}
