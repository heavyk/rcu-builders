var Ractive = require('ractive');


var component = { exports: {} };


	var foo = require( 'test' ).foo;

	component.exports = {
		data: function () {
			return { foo: foo }
		}
	};


component.exports.template = {v:3,t:[{p:[1,1,0],t:7,e:"p",f:["foo: ",{t:2,r:"foo",p:[1,9,8]}]}]};
component.exports.css = "";
component.exports.components = {  };

module.exports = Ractive.extend( component.exports );