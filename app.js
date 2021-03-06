/*jslint node: true */
'use strict';

var express  = require('express'),
	path = require('path'),
	app = express(),
	port = process.env.PORT || 8080,
	dust = require('express-dustjs'),
	sanitizer = require('sanitizer'),
	moment = require('moment'),
	Spotify = require('yfitops-web'),
	terminal = require('child_process').spawn('bash'),
	command = require('./config').command,
	spotifyUri = require('spotify-uri');

// Dustjs settings
dust._.optimizers.format = function (ctx, node) {
	return node;
};

app.engine('dust', dust.engine({
	useHelpers: true
}));

app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
	console.log('Page view at ' + moment().toLocaleString());
	var info = {},
		secrets = req.query && req.query.secret;

		secrets = sanitizer.sanitize(secrets);

	if (secrets){
		var uriType;

		console.log('******');
		console.log('secret entered: ' + secrets);
		console.log('******');

		if (secrets.indexOf('open.spotify.com') > -1) {
			var parsed = spotifyUri.parse(secrets);
			secrets = spotifyUri.formatURI(parsed);
		}

		try {
			uriType = Spotify.uriType(secrets);
			info.feedback = 'SUCCESS!';
		} catch(e) {
			info.feedback = 'INVALID! Try another.';
		}
		
		if (uriType) {
			console.log('************************************************************************');
			terminal.stdin.write(command + ' ' + secrets + '\n', function(err) {
				terminal.stdin.end();
			});
		}
	}

	res.render('index', info);
});


// terminal configs
terminal.stdout.on('data', function (data) {
    console.log('out: ' + data);
});

terminal.stderr.on('data', function (data) {
    console.log('err: ' + data);
});

terminal.on('exit', function (code) {
    console.log('process completed with code: ' + code);
    console.log('************************************************************************');
});



console.log('Server started on http://localhost:' + port);
app.listen(port);

module.exports = app;