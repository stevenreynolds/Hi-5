/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var csrf = require('lusca').csrf();
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')({ session: session });
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');

/**
 * Controllers (route handlers).
 */

var homeController    = require('./controllers/home');
var userController    = require('./controllers/user');
var apiController     = require('./controllers/api');
var contactController = require('./controllers/contact');
var pageController    = require('./controllers/page');

var videoController   = require('./controllers/video');
var searchController  = require('./controllers/search');

var importController  = require('./controllers/import');
var youtubeController = require('./controllers/youtube');
var vimeoController   = require('./controllers/vimeo');

/**
 * API keys and Passport configuration.
 */
console.log(process.env.NODE_ENV)
switch(process.env.NODE_ENV){
    case 'development':
        var secrets = require('./config/secrets');
    case 'production':
        var secrets = require('./config/secrets_beta');
    case 'beta':
        var secrets = require('./config/secrets_beta');
    default:
        var secrets = require('./config/secrets_beta');
}

var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Connect to MongoDB.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

var hour = 3600000;
var day = hour * 24;
var week = day * 7;

/**
 * CSRF whitelist.
 */

var csrfExclude = ['/url1', '/url2'];

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  // CSRF protection.
  if (_.contains(csrfExclude, req.path)) return next();
  csrf(req, res, next);
});
app.use(function(req, res, next) {
  // Make user object available in templates.
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // Remember original destination before login.
  var path = req.path.split('/')[1];
  if (/auth|login|logout|signup|img|fonts|favicon/i.test(path)) {
    return next();
  }
  req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));

app.use(function(req, res, next) {
  //If Email is not set force redirect to the page to complete the profile
  if (req.url != '/account/complete-profile' && req.user && !req.user.email) {
      req.flash('errors', { msg: 'Hey your email is empty !' });
      return res.redirect('/account/complete-profile');
  }
  next();
});
/**
 * Main routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

app.get('/legal-notice', pageController.legalNotice);

app.get('/search', searchController.search);

app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

app.get('/account/complete-profile', passportConf.isAuthenticated, userController.completeProfile);
app.post('/account/complete-profile', passportConf.isAuthenticated, userController.postCompleteProfile);

app.get('/account/import', passportConf.isAuthenticated, importController.importVideos);
app.post('/account/import_complete', passportConf.isAuthenticated, importController.importComplete);

app.get('/account/import/vimeo', passportConf.isAuthenticated, importController.importVimeo);
app.post('/account/import/vimeo', passportConf.isAuthenticated, importController.importSelected);

app.get('/account/import/google', passportConf.isAuthenticated, importController.importYoutube);

app.get('/video/:id', videoController.getVideo);


//app.get('/import', youtubeController.getYoutube);
//app.get('/import', vimeoController.getVimeo);

/**
 * API examples routes.
 */

app.get('/api', apiController.getApi);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);
//app.get('/api/vimeo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.get('/api/instagram', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getInstagram);

/**
 * OAuth sign-in routes.
 */

app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), function(req, res) {
  if(!req.user.email) res.redirect('/account/complete-profile');
  else res.redirect(req.session.returnTo || '/');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_friends', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

app.get('/auth/google', passport.authenticate('google', { 
      scope: 'profile email https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly', 
      accessType: 'offline',
      approvalPrompt: 'force'
}));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  if(!req.user.email) res.redirect('/account/complete-profile');
  else res.redirect(req.session.returnTo || '/');
});

app.get('/auth/vimeo', passport.authenticate('vimeo'));
app.get('/auth/vimeo/callback', passport.authenticate('vimeo', { failureRedirect: '/login' }), function(req, res) {
  if(!req.user.email) res.redirect('/account/complete-profile');
  else res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes for API examples.
 */

// app.get('/auth/foursquare', passport.authorize('foursquare'));
// app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
//   res.redirect('/api/foursquare');
// });
// app.get('/auth/tumblr', passport.authorize('tumblr'));
// app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
//   res.redirect('/api/tumblr');
// });
// app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
// app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
//   res.redirect('/api/venmo');
// });

/**
 * 500 Error Handler.
 */

app.use(errorHandler());


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
});

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;