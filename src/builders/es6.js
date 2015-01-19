import createBody from '../utils/createBody';

export default function es6 ( definition ) {
	var imports,
		importBlock = '',
		dependencies,
		dependencyBlock = '',
		builtModule,
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
`var __dependencies__ = {
	${dependencies.join( ',\n\t' )}
};

function require ( path ) {
	if ( __dependencies__.hasOwnProperty( path ) ) {
		return __dependencies__[ path ];
	}

	throw new Error( 'Could not find required module "' + path + '"' );
}

`;
	}

	if ( imports.length ) {
		importBlock = imports.join( '\n\t' ) + ';\n\n';
	}

	builtModule =
		importBlock +
		dependencyBlock +
		createBody( definition ) +
		'export default __export__;';

	return builtModule;
}
