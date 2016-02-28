/*jslint node: true */
'use strict';

var express  = require('express'),
    path = require('path'),
    app = express(),
    port = process.env.PORT || 8080,
    dust = require('express-dustjs'),
    sanitizer = require('sanitizer'),
    Spotify = require('yfitops-web'),
    exec = require('child_process').exec,
    command = require('./config').command;

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
	var info = {},
		secrets = req.query && req.query.secret;

		secrets = sanitizer.sanitize(secrets);



	if (secrets){
		var uriType;

		try {
			uriType = Spotify.uriType(secrets);
			info.feedback = 'SUCCESS!';
		} catch(e) {
			info.feedback = 'INVALID! Try another.';
		}
		
		if (uriType) {
			exec(command + ' ' + secrets, function (err){
				if (err) {
					console.log(err)
				}
			});
		}
	}

	console.log(secrets);
    res.render('index', info);
});


console.log('Server started on http://localhost:' + port);
app.listen(port);

module.exports = app;