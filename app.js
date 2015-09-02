
var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TotpStrategy = require('passport-totp').Strategy;


var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); //

passport.use(new LocalStrategy(function(username, password, done) { 
	if( username === 'admin') {
		// res.redirect('/factor2');
		
	}
	if (username === 'foo' && password === 'bar') {
		done(null, { name: "Balto", key: "3333"  });
	}
	else {
		done(null, false);
	}
}));


passport.use(new TotpStrategy(
    function(user, done) {
        // The user object carries all user related information, including
        // the shared-secret (key) and password.
        var key = user.key;
        if(!key) {
            return done(new Error('No key'));
        } else {
            return done(null, base32.decode(key), 30); //30 = valid key period
        }
    })
);

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
	res.render("index", {
		isAuthenticated:  req.isAuthenticated(),
		user: req.user
	});
});

app.get('/failed', function(req, res) {
	res.render("failed", {
		isAuthenticated:  req.isAuthenticated(),
		user: req.user
	});
});

app.get('/login', function(req, res) {
	res.render("login1", {
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
});

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/failed' }),
    function(req, res) {
        if(req.user.key) {
            req.session.method = 'totp';
            res.redirect('/totp');
        } else {
            req.session.method = 'plain';
            res.redirect('/');
        }
    }
);



function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated() ) {
		next();  // bug here. doesn't work
	} else {
		res.redirect("/login?returnTo=");		
	}
}

app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
});





app.get('/totp', isLoggedIn,
  function(req, res, next) {
    // If user hasn't set up two-factor auth, redirect
	/*
	findKeyForUserId(req.user.id, function(err, obj) {
		if (err) { return next(err); }
		if (!obj) { return res.redirect('/setup'); }
			return next();
    });*/
	
	return next();
  },
  function(req, res) {
	  res.render('pin'); //, { user: req.user, message: req.flash('error') });
  }
);

app.post('/totp', 
  passport.authenticate('totp', { failureRedirect: '/totp', failureFlash: true }),
  function(req, res) {
    req.session.secondFactor = 'totp';
    res.redirect('/');
});
		
		
		

/*

app.get('/api/data', ensureAuthenticated, function(req, res) {
	res.json(
			[ 
				{ value: "foo"},
				{ value: "bar"},
				{ value: "suck"},
			]
	
	);
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
*/

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

function ensureTotp(req, res, next) {
    if((req.user.key && req.session.method == 'totp') ||
       (!req.user.key && req.session.method == 'plain')) {
        next();
    } else {
        res.redirect('/login');
    }
}


var port = process.env.PORT || 3000;
app.listen(port, function() { 
	console.log("http://localhost:" + port); 
});