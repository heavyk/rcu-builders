var gobble = require( 'gobble' );

module.exports = gobble( 'src' )
	.transform( 'babel', {
		blacklist: [ 'es6.modules', 'useStrict' ],
		sourceMap: false
	})
	.transform( 'esperanto-bundle', {
		entry: 'index',
		type: 'cjs',
		dest: 'rcu-builders',
		strict: true,
		sourceMap: false
	});
