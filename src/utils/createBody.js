import CleanCSS from 'clean-css';
import toSource from 'tosource';

export default function createBody ( definition, exportMechanism ) {
	const css = definition.css ? new CleanCSS().minify( definition.css ).styles : '';
	const imports = definition.imports.map( getImportKeyValuePair );

	return `
var component = { exports: {} };

${definition.script}

component.exports.template = ${toSource( definition.template, null, '' )};
component.exports.css = ${toSource( css )};
component.exports.components = { ${imports.join( ', ')} };

${exportMechanism} Ractive.extend( component.exports );`.slice( 1 );
}

function getImportKeyValuePair ( imported, i ) {
	return `${stringify(imported.name)}: __import${i}__`;
}

function stringify ( key ) {
	if ( /^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test( key ) ) {
		return key;
	}

	return JSON.stringify( key );
}
