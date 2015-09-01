
var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); //

passport.use(new LocalStrategy(function(username, password, done) { 
  if (username === 'foo' && password === 'bar') {
	  done(null, { user: username });
  }
  else {
	  done(null, false);
  }
}));

passport.serializeUser(function(user, done) { 
  done(null, user);
});

passport.deserializeUser(function(user, done) { 
  done(null, user);
});

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'secret' }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	res.render("ejs1", {
		isAuthenticated: false,
		user: req.user
	});
});

app.get('/login', function(req, res) {
	res.render("login1", {
		isAuthenticated: false,
		user: req.user
	});
});

app.get('/success', function(req, res) {
	console.log("Login Success");
});

app.get('/failure', function(req, res) {
	console.log("Failure");
});

app.post('/login', passport.authenticate('local', { 
  successRedirect: '/success',
  failureRedirect: '/failure'
}));

var port = process.env.PORT || 3000;
app.listen(port, function() { 
	console.log("http://localhost:" + port); 
});