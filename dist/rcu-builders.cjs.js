'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var CleanCSS = _interopDefault(require('clean-css'));
var toSource = _interopDefault(require('tosource'));
var rcu = require('rcu');

function createOutro(definition) {
	var indent = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

	var css = definition.css ? new CleanCSS().minify(definition.css).styles : '';
	var imports = definition.imports.map(function (imported, i) {
		return stringify(imported.name) + ': __import' + (definition.modules.length + i) + '__';
	});

	var outro = [indent + 'component.exports.template = ' + toSource(definition.template, null, '') + ';'];

	if (css) outro.push(indent + 'component.exports.css = ' + toSource(css) + ';');
	if (imports.length) outro.push(indent + 'component.exports.components = { ' + imports.join(', ') + ' };');

	return outro.join('\n');
}

function stringify(key) {
	if (/^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(key)) {
		return key;
	}

	return JSON.stringify(key);
}

var alreadyWarned = false;

function deprecateToString(code, map, type) {
	return {
		code: code, map: map,
		toString: function toString() {
			if (!alreadyWarned) {
				console.error("[DEPRECATION] As of 0.4.0, rcu-builders." + type + " returns a { code, map } object, rather than returning code directly"); // eslint-disable-line no-console
				alreadyWarned = true;
			}

			return code;
		}
	};
}

var getImportPath = function getImportPath(imported) {
	return imported.href.replace(/\.[a-zA-Z]+$/, '');
};
var quote = function quote(str) {
	return '"' + str + '"';
};
var getDependencyName = function getDependencyName(x, i) {
	return '__import' + i + '__';
};

function amd(definition) {
	var outro = createOutro(definition, '\t');

	var dependencies = definition.imports.map(getImportPath).concat(definition.modules);

	var paths = dependencies.map(quote).concat('"require"', '"ractive"');
	var args = dependencies.map(getDependencyName).concat('require', 'Ractive');

	var code = ('\ndefine([ ' + paths.join(', ') + ' ], function ( ' + args.join(', ') + ' ) {\n\n\tvar component = { exports: {} };\n\n' + definition.script + '\n' + outro + '\n\n\treturn Ractive.extend( component.exports );\n\n});').slice(1);

	// TODO sourcemap support

	return deprecateToString(code, null, 'amd');
}

function cjs(definition) {
	var outro = createOutro(definition);

	var requires = definition.imports.map(function (imported, i) {
		var path = imported.href.replace(/\.[a-zA-Z]+$/, '');
		return 'var __import' + i + '__ = require(\'' + path + '\');';
	});

	var code = ('\nvar Ractive = require(\'ractive\');\n' + requires.join('\n') + '\n\nvar component = { exports: {} };\n' + definition.script + '\n' + outro + '\n\nmodule.exports = Ractive.extend( component.exports );').slice(1);

	// TODO sourcemap support

	return deprecateToString(code, null, 'cjs');
}

var requirePattern = /require\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;

function es6(definition) {
	var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var outro = createOutro(definition);

	var imports = ['import Ractive from \'ractive\';'];
	var script = definition.script;
	var counter = 0;

	if (definition.modules.length) {
		definition.modules.forEach(function (path) {
			imports.push('import __import' + counter + '__ from \'' + path + '\';');
			script = script.replace(requirePattern, function (str, _, p) {
				return p === path ? '__import' + counter + '__' : str;
			});
			counter += 1;
		});
	}

	definition.imports.forEach(function (imported) {
		var path = imported.href;

		if (!options.preserveExtensions) {
			path = path.replace(/\.[a-zA-Z]+$/, '');
		}

		imports.push('import __import' + counter + '__ from \'' + path + '\';');
		counter += 1;
	});

	var importBlock = imports.join('\n');

	var beforeScript = [importBlock, '// component: ' + definition.name, 'var component = { exports: {} };'].join('\n');

	var code = [beforeScript, script, outro, 'export default Ractive.extend( component.exports );'].join('\n');

	var map = options.sourceMap ? rcu.generateSourceMap(definition, {
		offset: beforeScript.split('\n').length,
		hires: options.hires !== false,
		file: options.sourceMapFile,
		source: options.sourceMapSource,
		content: definition.source
	}) : null;

	return deprecateToString(code, map, 'es6');
}

exports.amd = amd;
exports.cjs = cjs;
exports.es6 = es6;