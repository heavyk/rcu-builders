var Ractive = require('ractive');


var component = { exports: {} };



component.exports.template = {v:3,t:[{p:[1,1,0],t:7,e:"h1",f:["Hello ",{t:2,r:"name",p:[1,11,10]},"!"]}]};
component.exports.css = "";
component.exports.components = {  };

module.exports = Ractive.extend( component.exports );