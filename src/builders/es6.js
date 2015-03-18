import rcu from 'rcu';
import createBody from '../utils/createBody';

export default function es6 ( definition, options = {} ) {
	var imports,
		importBlock = '',
		dependencies,
		dependencyBlock = '',
		{ intro, body, outro } = createBody( definition ),
		beforeScript,
		afterScript,
		builtModule,
		exportBlock,
		counter = 0;

	imports = [ `import Ractive from 'ractive';` ];

	definition.imports.forEach( imported => {
		var path = imported.href.replace( /\.[a-zA-Z]+$/, '' );
		imports.push( `import __import${counter}__ from '${path}';` );
		counter += 1;
	});

	if ( definition.modules.length ) {
		dependencies = [];

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

	importBlock = imports.join( '\n' );
	exportBlock = 'export default __export__;';

	beforeScript = [
		importBlock,
		intro,
		dependencyBlock
	].join( '\n' );

	afterScript = [
		outro,
		exportBlock
	].join( '\n' );

	builtModule = [
		beforeScript,
		body,
		afterScript
	].join( '\n' );

	if ( options.sourceMap && definition.script ) {
		let sourceMap = rcu.generateSourceMap( definition, {
			padding: beforeScript.split( '\n' ).length,
			file: options.sourceMapFile,
			source: options.sourceMapSource,
			content: definition.source
		});

		builtModule += '\n\/\/# sourceMappingURL=' + sourceMap.toUrl();
	}

	return builtModule;
}
