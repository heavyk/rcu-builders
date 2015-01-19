'use strict';

var CleanCSS = require('clean-css');
CleanCSS = ('default' in CleanCSS ? CleanCSS['default'] : CleanCSS);
var toSource = require('tosource');
toSource = ('default' in toSource ? toSource['default'] : toSource);

function createBody(definition) {
  var body = "" + "var __options__ = {\n" + "\ttemplate: " + toSource(definition.template, null, "") + ",\n" + (definition.css ? "\tcss:" + JSON.stringify(new CleanCSS().minify(definition.css).styles) + ",\n" : "") + (definition.imports.length ? "\tcomponents:{" + definition.imports.map(getImportKeyValuePair).join(",\n") + "}\n" : "") + "},\n" + "component={},\n" + "__prop__,\n" + "__export__;";

  if (definition.script) {
    body += "\n" + definition.script + "\n" + "if ( typeof component.exports === \"object\" ) {\n\tfor ( __prop__ in component.exports ) {\n\t\tif ( component.exports.hasOwnProperty(__prop__) ) {\n\t\t\t__options__[__prop__] = component.exports[__prop__];\n\t\t}\n\t}\n}";
  }

  body += "__export__ = Ractive.extend( __options__ );\n";
  return body;
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
  var dependencies, builtModule;

  dependencies = definition.imports.map(getImportPath).concat(definition.modules);

  builtModule = "" + ("define([\n\t" + dependencies.map(quote).concat("\"require\"", "\"ractive\"").join(",\n\t") + "\n], function(\n\t" + dependencies.map(getDependencyName).concat("require", "Ractive").join(",\n\t") + "\n){\n\n" + createBody(definition) + "\n\n\treturn __export__;\n});");

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
  var requireStatements, builtModule;

  requireStatements = definition.imports.map(function (imported, i) {
    var path = imported.href.replace(/\.[a-zA-Z]+$/, "");
    return "__import" + i + "__ = require('" + path + "')";
  });

  requireStatements.unshift("Ractive = require('ractive')");

  builtModule = "var " + requireStatements.join(",\n\t") + ";\n\n" + createBody(definition) + "module.exports = __export__;";

  return builtModule;
}

exports.cjs = cjs;

function es6(definition) {
  var imports, importBlock = "", dependencies, dependencyBlock = "", builtModule, counter = 0;

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

    dependencyBlock = "var __dependencies__ = {\n\t" + dependencies.join(",\n\t") + "\n};\n\nfunction require ( path ) {\n\tif ( __dependencies__.hasOwnProperty( path ) ) {\n\t\treturn __dependencies__[ path ];\n\t}\n\n\tthrow new Error( 'Could not find required module \"' + path + '\"' );\n}\n\n";
  }

  if (imports.length) {
    importBlock = imports.join("\n\t") + ";\n\n";
  }

  builtModule = importBlock + dependencyBlock + createBody(definition) + "export default __export__;";

  return builtModule;
}

exports.es6 = es6;

