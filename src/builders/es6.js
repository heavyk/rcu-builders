import { generateSourceMap } from 'rcu';
import createOutro from '../utils/createOutro';
import deprecateToString from '../utils/deprecateToString';

const requirePattern = /require\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;

export default function es6 ( definition, options = {} ) {
	let outro = createOutro( definition );

	let imports = [ `import Ractive from 'ractive';` ];
	let script = definition.script;
	let counter = 0;

	if ( definition.modules.length ) {
		definition.modules.forEach( path => {
			imports.push( `import __import${counter}__ from '${path}';` );
			script = script.replace( requirePattern, (str, _, p) => p === path ? `__import${counter}__` : str );
			counter += 1;
		});
	}

	definition.imports.forEach( imported => {
		let path = imported.href;

		if ( !options.preserveExtensions ) {
			path = path.replace( /\.[a-zA-Z]+$/, '' );
		}

		imports.push( `import __import${counter}__ from '${path}';` );
		counter += 1;
	});

	const importBlock = imports.join( '\n' );

	const beforeScript = [
		importBlock,
		`// component: ${definition.name}`,
		'var component = { exports: {} };'
	].join( '\n' );

	const code = [
		beforeScript,
		script,
		outro,
		'export default Ractive.extend( component.exports );'
	].join( '\n' );

	const map = options.sourceMap ?
		generateSourceMap( definition, {
			offset: beforeScript.split( '\n' ).length,
			hires: options.hires !== false,
			file: options.sourceMapFile,
			source: options.sourceMapSource,
			content: definition.source
		}) :
		null;

	return deprecateToString( code, map, 'es6' );
}
