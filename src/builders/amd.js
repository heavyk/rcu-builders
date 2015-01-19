import createBody from '../utils/createBody';

export default function amd ( definition ) {
	var dependencies, builtModule;

	dependencies = definition.imports.map( getImportPath ).concat( definition.modules );

	builtModule = '' +
`define([
	${dependencies.map( quote ).concat( '"require"', '"ractive"' ).join( ',\n\t' )}
], function(
	${dependencies.map( getDependencyName ).concat( 'require', 'Ractive' ).join( ',\n\t' )}
){

${createBody( definition )}

	return __export__;
});`;

	return builtModule;
}

function getImportPath ( imported ) {
	return imported.href.replace( /\.[a-zA-Z]+$/, '' );
}

function quote ( str ) {
	return `"${str}"`;
}

function getDependencyName ( imported, i ) {
	return `__import${i}__`;
}
