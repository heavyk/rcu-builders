import createBody from '../utils/createBody';

export default function cjs ( definition ) {
	var requireStatements, builtModule;

	requireStatements = definition.imports.map( function ( imported, i ) {
		var path = imported.href.replace( /\.[a-zA-Z]+$/, '' );
		return `__import${i}__ = require('${path}')`;
	});

	requireStatements.unshift( `Ractive = require('ractive')` );

	builtModule = 'var ' + requireStatements.join( ',\n\t' ) + ';\n\n' +
	createBody( definition ) +
	'module.exports = __export__;';

	return builtModule;
}
