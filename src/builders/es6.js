import { generateSourceMap } from 'rcu';
import createBody from '../utils/createBody';

export default function es6 ( definition, options = {} ) {
	let { intro, body, outro } = createBody( definition );

	let imports = [ `import Ractive from 'ractive';` ];
	let counter = 0;

	definition.imports.forEach( imported => {
		let path = imported.href;

		if ( !options.preserveExtensions ) {
			path = path.replace( /\.[a-zA-Z]+$/, '' );
		}

		imports.push( `import __import${counter}__ from '${path}';` );
		counter += 1;
	});

	let dependencyBlock = '';

	if ( definition.modules.length ) {
		let dependencies = [];

		definition.modules.forEach( path => {
			imports.push( `import __import${counter}__ from '${path}';` );
			dependencies.push( `\t'${path}': __import${counter}__` );
			counter += 1;
		});

		dependencyBlock =
`(function () {
	var __dependencies__ = {
		${dependencies.join( ',\n\t' )}
	};

	var require = function ( path ) {
		if ( __dependencies__.hasOwnProperty( path ) ) {
			return __dependencies__[ path ];
		}

		throw new Error( 'Could not find required module "' + path + '"' );
	}

`;

		outro += '\n})();\n\n';
	}

	const importBlock = imports.join( '\n' );
	const exportBlock = 'export default __export__;';

	const beforeScript = [
		importBlock,
		intro,
		dependencyBlock
	].join( '\n' );

	const afterScript = [
		outro,
		exportBlock
	].join( '\n' );

	let builtModule = [
		beforeScript,
		body,
		afterScript
	].join( '\n' );

	if ( options.sourceMap && definition.script ) {
		let sourceMap = generateSourceMap( definition, {
			padding: beforeScript.split( '\n' ).length,
			file: options.sourceMapFile,
			source: options.sourceMapSource,
			content: definition.source
		});

		builtModule += '\n\/\/# sourceMappingURL=' + sourceMap.toUrl();
	}

	return builtModule;
}
