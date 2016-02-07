import createBody from '../utils/createBody';
import deprecateToString from '../utils/deprecateToString';

const getImportPath = imported => imported.href.replace( /\.[a-zA-Z]+$/, '' );
const quote = str => `"${str}"`;
const getDependencyName = ( x, i ) => `__import${i}__`;

export default function amd ( definition ) {
	const body = createBody( definition, 'return' );

	const dependencies = definition.imports.map( getImportPath ).concat( definition.modules );

	const paths = dependencies.map( quote ).concat( '"require"', '"ractive"' );
	const args = dependencies.map( getDependencyName ).concat( 'require', 'Ractive' );

	const code = `
define([ ${paths.join( ', ' )} ], function ( ${args.join( ', ' )} ) {

${body}

});`.slice( 1 );

	// TODO sourcemap support

	return deprecateToString( code, null, 'amd' );
}
