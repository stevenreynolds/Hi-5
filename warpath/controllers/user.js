var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var Video = require('../models/Video');
var secrets = require('../config/secrets');
var request = require('request');
var moment = require('moment');

/**
 * GET /user/:slug
 * User page.
 */

function calculateAge (birthDate) {
    birthDate = new Date(birthDate);
    otherDate = new Date();

    var years = (otherDate.getFullYear() - birthDate.getFullYear());

    if (otherDate.getMonth() < birthDate.getMonth() || 
        otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
        years--;
    }

    return years;
}


exports.getUser = function(req, res) {
  var slug = req.params.slug;
  if(!slug) res.send('No SLug')

  async.waterfall([
      function(callback){
          User
            .findOne({ 'profile.slug': slug },{ tokens: 0 })
            .lean()
            .exec(function (err, profile) {
              if (err) callback(err);

              profile.profile.age = calculateAge(profile.profile.birthdate);

              console.log('PPPPPPPPPPPPPPPROFILEEEEEEEEEE')
              console.log(profile)
              console.log('PPPPPPPPPPPPPPPROFILEEEEEEEEEE')

              callback(null, profile);

            });
      },
      function(profile, callback){

          var adress = encodeURIComponent(profile.profile.city + ' ' + profile.profile.country);
          var geocode_url = "http://api.tiles.mapbox.com/v3/warpath.ik58n87j/geocode/" + adress + ".json";

          console.log(geocode_url)

          request(geocode_url, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              body = JSON.parse(body)
              console.log(body.results)

              profile.profile.geocode = body.results[0][0];

              callback(null, profile);

            } else {
              callback(err);
            }
          })
      },
      function(profile, callback){

        if(profile.videos.length > 0){

          Video
            //.findOne({ _id: videoID })
            //not perfect but collision between vimeo id and youtube id will be rare like 1 in 1 billion
            .find({'_id': {'$in': profile.videos } })
            .lean() //Very Important !
            .populate('_video_data')
            .limit(4)
            .exec(function (err, videos) {
              if (err) callback(err)
              console.log(videos)

              var vids = [];

              _(videos).forEach(function(video){

                      var video_data = video._video_data;

                      if(video.platform == 'youtube'){
                        var ytDate = video_data.snippet.publishedAt;
                        ytDate = ytDate.substr(0, 11);
                        
                        var date = moment(ytDate);
                        date = date.format('DD MMM YYYY');

                        var likes = video_data.statistics.likeCount;
                        var views = video_data.statistics.viewCount;

                        var temp = video._id.split("_");
                        var id = temp[1];

                        var video = {
                              id:           id
                            , platform:     'youtube'
                            , link:         'http://youtu.be/' + id
                            , title:        video_data.snippet.title
                            , description:  video_data.snippet.description
                            , image:        'http://img.youtube.com/vi/' + id + '/mqdefault.jpg'
                            , _creator:     video._creator
                            , location:     video.location
                            , likes:        likes
                            , views:        views
                            , date:         date
                        }

                        vids.push(video);
                      }

                      if(video.platform == 'vimeo'){
                        console.log(video_data.created_time)
                        var date = moment(video_data.created_time)
                        date = date.format('DD MMM YYYY');

                        var likes = video_data.stats.likes;
                        var views = video_data.stats.plays;

                        var videoID = video._video_data.uri.replace('/videos/', '');

                        var video = {
                              id:           videoID
                            , platform:     'vimeo'
                            , link:         video_data.link
                            , title:        video_data.name
                            , description:  video_data.description
                            , image:        video_data.pictures[5].link
                            , _creator:     video._creator
                            , location:     video.location
                            , likes:        likes
                            , views:        views
                            , date:         date
                        }

                        vids.push(video);
                      }

                  });

                  callback(null, profile, vids);
                
            });

        }
          
      }
  ], function (err, profile, vids) {

      if(err) console.log(err)

      res.render('user', {
        title: slug,
        user: profile,
        videos: vids
      });

     // result now equals 'done'    
  });

};

/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
 */

exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postSignup = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  req.assert('city', 'City is not valid').notEmpty();
  req.assert('country', 'Country is not valid').notEmpty();
  req.assert('birthdate', 'BirthDate is not valid').notEmpty();
  req.assert('name', 'Donne ton blaze !').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var birthDate = moment(req.body.birthdate);

  var user = new User({
    email:              req.body.email,
    password:           req.body.password,

    'profile.name'      : req.body.name,
    'profile.city'      : req.body.city,
    'profile.country'   : req.body.country,
    'profile.motivation': req.body.motivation,
    'profile.company'   : req.body.company,
    'profile.birthdate' : birthDate,

  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'On a déjà un gars avec cette adresse email !' });
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */

exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.updated = new Date;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param password
 */

exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */

exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 * @param provider
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */

exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 * @param token
 */

exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */

exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email
 */

exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};



/**
 * GET /account/complete-profile
 * Complete profile page.
 */

exports.completeProfile = function(req, res) {
  if (req.user && req.user.email) return res.redirect('/');
  res.render('account/complete-profile', {
    title: 'Complete Your Profile'
  });
};


/**
 * POST /account/complete-profile
 * Verify Data
 */

exports.postCompleteProfile = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account/complete-profile');
  }

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/account/complete-profile');
    }

    User.update({_id: req.user.id}, {
      email: req.body.email
    }, function(err, numberAffected, rawResponse) {
        if (err) console.log(err)

        req.flash('success', { msg: 'Account OK!' });
        return res.redirect('/');
    })

  });
};
