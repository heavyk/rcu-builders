'use strict';

var rcu = require('rcu');
rcu = ('default' in rcu ? rcu['default'] : rcu);
var CleanCSS = require('clean-css');
CleanCSS = ('default' in CleanCSS ? CleanCSS['default'] : CleanCSS);
var toSource = require('tosource');
toSource = ('default' in toSource ? toSource['default'] : toSource);

function createBody(definition) {
  var intro = "" + "var __options__ = {\n" + "\ttemplate: " + toSource(definition.template, null, "") + ",\n" + (definition.css ? "\tcss:" + JSON.stringify(new CleanCSS().minify(definition.css).styles) + ",\n" : "") + (definition.imports.length ? "\tcomponents:{" + definition.imports.map(getImportKeyValuePair).join(",\n") + "}\n" : "") + "},\n" + "component={},\n" + "__prop__,\n" + "__export__;";

  var body = definition.script;

  var outro = "if ( typeof component.exports === \"object\" ) {\n\tfor ( __prop__ in component.exports ) {\n\t\tif ( component.exports.hasOwnProperty(__prop__) ) {\n\t\t\t__options__[__prop__] = component.exports[__prop__];\n\t\t}\n\t}\n}\n\n__export__ = Ractive.extend( __options__ );\n";

  return { intro: intro, body: body, outro: outro };
}

function getImportKeyValuePair(imported, i) {
  return "\t" + stringify(imported.name) + ": __import" + i + "__";
}

function stringify(key) {
  if (/^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(key)) {
    return key;
  }

  return JSON.stringify(key);
}

function amd(definition) {
  var dependencies;var builtModule;var _createBody = createBody(definition);

  var intro = _createBody.intro;
  var body = _createBody.body;
  var outro = _createBody.outro;


  dependencies = definition.imports.map(getImportPath).concat(definition.modules);

  builtModule = "" + ("define([\n\t" + dependencies.map(quote).concat("\"require\"", "\"ractive\"").join(",\n\t") + "\n], function(\n\t" + dependencies.map(getDependencyName).concat("require", "Ractive").join(",\n\t") + "\n){\n\n" + intro + "\n" + body + "\n" + outro + "\n\n\treturn __export__;\n});");

  return builtModule;
}

function getImportPath(imported) {
  return imported.href.replace(/\.[a-zA-Z]+$/, "");
}

function quote(str) {
  return "\"" + str + "\"";
}

function getDependencyName(imported, i) {
  return "__import" + i + "__";
}

exports.amd = amd;

function cjs(definition) {
  var requireStatements;var builtModule;var _createBody = createBody(definition);

  var intro = _createBody.intro;
  var body = _createBody.body;
  var outro = _createBody.outro;


  requireStatements = definition.imports.map(function (imported, i) {
    var path = imported.href.replace(/\.[a-zA-Z]+$/, "");
    return "__import" + i + "__ = require('" + path + "')";
  });

  requireStatements.unshift("Ractive = require('ractive')");

  builtModule = "var " + requireStatements.join(",\n\t") + ";\n\n" + intro + body + outro + "module.exports = __export__;";

  return builtModule;
}

exports.cjs = cjs;

function es6(definition) {
  var options = arguments[1] === undefined ? {} : arguments[1];
  var imports;
  var importBlock = "";
  var dependencies;
  var dependencyBlock = "";var _createBody = createBody(definition);

  var intro = _createBody.intro;
  var body = _createBody.body;
  var outro = _createBody.outro;
  var beforeScript;
  var afterScript;
  var builtModule;
  var exportBlock;
  var counter = 0;

  imports = ["import Ractive from 'ractive';"];

  definition.imports.forEach(function (imported) {
    var path = imported.href.replace(/\.[a-zA-Z]+$/, "");
    imports.push("import __import" + counter + "__ from '" + path + "';");
    counter += 1;
  });

  if (definition.modules.length) {
    dependencies = [];

    definition.modules.forEach(function (path) {
      imports.push("import __import" + counter + "__ from '" + path + "';");
      dependencies.push("\t'" + path + "': __import" + counter + "__");
      counter += 1;
    });

    dependencyBlock = "(function () {\n\tvar __dependencies__ = {\n\t\t" + dependencies.join(",\n\t") + "\n\t};\n\n\tvar require = function ( path ) {\n\t\tif ( __dependencies__.hasOwnProperty( path ) ) {\n\t\t\treturn __dependencies__[ path ];\n\t\t}\n\n\t\tthrow new Error( 'Could not find required module \"' + path + '\"' );\n\t}\n\n";

    outro += "\n})();\n\n";
  }

  importBlock = imports.join("\n");
  exportBlock = "export default __export__;";

  beforeScript = [importBlock, intro, dependencyBlock].join("\n");

  afterScript = [outro, exportBlock].join("\n");

  builtModule = [beforeScript, body, afterScript].join("\n");

  if (options.sourceMap && definition.script) {
    var sourceMap = rcu.generateSourceMap(definition, {
      padding: beforeScript.split("\n").length,
      file: options.sourceMapFile,
      source: options.sourceMapSource,
      content: definition.source
    });

    builtModule += "\n//# sourceMappingURL=" + sourceMap.toUrl();
  }

  return builtModule;
}

exports.es6 = es6;

