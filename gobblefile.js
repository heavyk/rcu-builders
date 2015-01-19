var gobble = require( 'gobble' );

module.exports = gobble( 'src' )
	.transform( '6to5', {
		blacklist: [ 'modules', 'useStrict' ],
		sourceMap: false
	})
	.transform( 'esperanto-bundle', {
		entry: 'index',
		type: 'cjs',
		dest: 'rcu-builders',
		strict: true,
		sourceMap: false
	});