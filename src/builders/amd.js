import createBody from '../utils/createBody';
import deprecateToString from '../utils/deprecateToString';

const getImportPath = imported => imported.href.replace( /\.[a-zA-Z]+$/, '' );
const quote = str => `"${str}"`;
const getDependencyName = ( x, i ) => `__import${i}__`;

export default function amd ( definition ) {
	const { intro, body, outro } = createBody( definition );

	const dependencies = definition.imports.map( getImportPath ).concat( definition.modules );

	const code = '' +
`define([
	${dependencies.map( quote ).concat( '"require"', '"ractive"' ).join( ',\n\t' )}
], function(
	${dependencies.map( getDependencyName ).concat( 'require', 'Ractive' ).join( ',\n\t' )}
){

${intro}
${body}
${outro}

	return __export__;
});`;

	// TODO sourcemap support

	return deprecateToString( code, null, 'amd' );
}
