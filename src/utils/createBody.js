import CleanCSS from 'clean-css';
import toSource from 'tosource';

export default function createBody ( definition ) {
	var body = '' +
		'var __options__ = {\n' +
		'	template: ' + toSource( definition.template, null, '' ) + ',\n' +
		( definition.css ?
		'	css:' + JSON.stringify( new CleanCSS().minify( definition.css ).styles ) + ',\n' : '' ) +
		( definition.imports.length ?
		'	components:{' + definition.imports.map( getImportKeyValuePair ).join( ',\n' ) + '}\n' : '' ) +
		'},\n' +
		'component={},\n' +
		'__prop__,\n' +
		'__export__;';

	if ( definition.script ) {
		body += '\n' + definition.script + '\n' +
`if ( typeof component.exports === "object" ) {
	for ( __prop__ in component.exports ) {
		if ( component.exports.hasOwnProperty(__prop__) ) {
			__options__[__prop__] = component.exports[__prop__];
		}
	}
}`;
	}

	body += '__export__ = Ractive.extend( __options__ );\n';
	return body;
}

function getImportKeyValuePair ( imported, i ) {
	return `\t${stringify(imported.name)}: __import${i}__`;
}

function stringify ( key ) {
	if ( /^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test( key ) ) {
		return key;
	}

	return JSON.stringify( key );
}
