var Ractive = require('ractive');
var __import0__ = require('./Foo');

var component = { exports: {} };



component.exports.template = {v:3,t:[{p:[3,1,40],t:7,e:"h1",f:["Main"]}," ",{p:[4,1,54],t:7,e:"Foo"}]};
component.exports.css = "";
component.exports.components = { Foo: __import0__ };

module.exports = Ractive.extend( component.exports );