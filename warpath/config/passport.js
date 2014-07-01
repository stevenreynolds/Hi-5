var _ = require('lodash');
var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var VimeoStrategy = require('passport-vimeo').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy; // Tumblr
var OAuth2Strategy = require('passport-oauth2').Strategy; // Venmo, Foursquare

var User = require('../models/User');
var secrets = require('./secrets');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Sign in with Instagram.

passport.use(new InstagramStrategy(secrets.instagram,function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ instagram: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.instagram = profile.id;
          user.tokens.push({ kind: 'instagram', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
          user.profile.website = user.profile.website || profile._json.data.website;
          user.save(function(err) {
            req.flash('info', { msg: 'Instagram account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ instagram: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);

      var user = new User();
      user.instagram = profile.id;
      user.tokens.push({ kind: 'instagram', accessToken: accessToken });
      user.profile.name = profile.displayName;
      // Similar to Twitter API, assigns a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      //user.email = profile.username + "@instagram.com";
      user.profile.website = profile._json.data.website;
      user.profile.picture = profile._json.data.profile_picture;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));

// Sign in using Email and Password.

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a <provider> id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

// Sign in with Facebook.

passport.use(new FacebookStrategy(secrets.facebook, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function(err) {
            req.flash('info', { msg: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

// Sign in with Twitter.

passport.use(new TwitterStrategy(secrets.twitter, function(req, accessToken, tokenSecret, profile, done) {
  if (req.user) {
    User.findOne({ twitter: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url;
          user.save(function(err) {
            req.flash('info', { msg: 'Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });

  } else {
    User.findOne({ twitter: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      //https://stackoverflow.com/questions/14864827/using-everyauth-passport-js-to-authenticate-with-twitter-whilst-asking-for-usern
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      //user.email = profile.username + "@twitter.com";
      user.twitter = profile.id;
      user.tokens.push({ kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret });
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.profile_image_url;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));

// Sign in with Google.

passport.use(new GoogleStrategy(secrets.google, function(req, accessToken, refreshToken, params, profile, done) {
// console.log(accessToken)
// console.log(refreshToken)
// console.log(params)

  if (req.user) {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken, refreshToken:refreshToken, expires_in:params.expires_in });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.picture;
          user.save(function(err) {
            req.flash('info', { msg: 'Google account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken, refreshToken:refreshToken, expires_in:params.expires_in });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.picture;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

// passport.use('vimeo', new OAuth2Strategy({
//     authorizationURL: 'https://api.vimeo.com/oauth/authorize',
//     tokenURL: 'https://api.vimeo.com/oauth/access_token',
//     clientID: secrets.vimeo.clientId,
//     clientSecret: secrets.vimeo.clientSecret,
//     callbackURL: secrets.vimeo.redirectUrl,
//     passReqToCallback: true
//   },
//   function(req, accessToken, refreshToken, profile, done) {

//     console.log(accessToken)
// console.log(refreshToken)
// console.log(profile)
// console.log(done)


//   }
// ));


passport.use(new VimeoStrategy(secrets.vimeo, function(req, accessToken, refreshToken, profile, done) {
    
    console.log(accessToken)
console.log(refreshToken)
console.log(profile)
console.log(done)

  if (req.user) {
    User.findOne({ vimeo: profile.id }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
          user.vimeo = profile.id;
          user.tokens.push({ kind: 'vimeo', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.pictures[0].link;
          user.save(function(err) {
            req.flash('info', { msg: 'Vimeo account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ vimeo: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      //https://stackoverflow.com/questions/14864827/using-everyauth-passport-js-to-authenticate-with-twitter-whilst-asking-for-usern
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a vimeo email address as follows:
      //user.email = profile.username + "@vimeo.com";
      user.vimeo = profile.id;
      user.tokens.push({ kind: 'vimeo', accessToken: accessToken });
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.pictures[0].link;
      user.save(function(err) {
        done(err, user);
      });
    });
  } 

  }
));


// passport.use('foursquare', new OAuth2Strategy({
//     authorizationURL: 'https://foursquare.com/oauth2/authorize',
//     tokenURL: 'https://foursquare.com/oauth2/access_token',
//     clientID: secrets.foursquare.clientId,
//     clientSecret: secrets.foursquare.clientSecret,
//     callbackURL: secrets.foursquare.redirectUrl,
//     passReqToCallback: true
//   },
//   function(req, accessToken, refreshToken, profile, done) {
//     User.findById(req.user._id, function(err, user) {
//       user.tokens.push({ kind: 'foursquare', accessToken: accessToken });
//       user.save(function(err) {
//         done(err, user);
//       });
//     });
//   }
// ));

// passport.use(new VimeoStrategy(secrets.vimeo, function(req, accessToken, tokenSecret, profile, done) {
//   console.log(accessToken)
//   console.log(tokenSecret)
//   console.log(profile)
//   console.log(done)

//   if (req.user) {
//     User.findOne({ vimeo: profile.id }, function(err, existingUser) {
//       if (existingUser) {
//         req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
//         done(err);
//       } else {
//         User.findById(req.user.id, function(err, user) {
//           user.vimeo = profile.id;
//           user.tokens.push({ kind: 'vimeo', accessToken: accessToken, tokenSecret: tokenSecret });
//           user.profile.name = user.profile.name || profile.displayName;
//           user.profile.location = user.profile.location || profile.person._json.location;
//           user.profile.picture = user.profile.picture || profile._json.person.portraits.portrait[0]._content;
//           user.save(function(err) {
//             req.flash('info', { msg: 'Vimeo account has been linked.' });
//             done(err, user);
//           });
//         });
//       }
//     });
//   } else {
//     User.findOne({ vimeo: profile.id }, function(err, existingUser) {
//       if (existingUser) return done(null, existingUser);
//       var user = new User();
//       //https://stackoverflow.com/questions/14864827/using-everyauth-passport-js-to-authenticate-with-twitter-whilst-asking-for-usern
//       // Twitter will not provide an email address.  Period.
//       // But a person’s twitter username is guaranteed to be unique
//       // so we can "fake" a vimeo email address as follows:
//       user.email = profile.username + "@vimeo.com";
//       user.twitter = profile.id;
//       user.tokens.push({ kind: 'vimeo', accessToken: accessToken, tokenSecret: tokenSecret });
//       user.profile.name = profile.displayName;
//       user.profile.location = profile.person._json.location;
//       user.profile.picture = profile._json.person.portraits.portrait[0]._content;
//       user.save(function(err) {
//         done(err, user);
//       });
//     });
//   }    

// }));

// TODO
// generateSlug = function(){
//   //Generate Slug
//   if(!user.profile.slug) {
//     User.count({ 'profile.slug': new RegExp('^' + slug(user.profile.name) + '$', 'i') }, function(err, count) {
//       if (err) console.log(err);
      
//       console.log(count)
//       if(count == 0)
//         user.profile.slug = slug(user.profile.name);
//       else
//         user.profile.slug = slug(user.profile.name + (count-1) );
//     }); 
//   }
// }

// Login Required middleware.

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// Authorization Required middleware.

exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect('/auth/' + provider);
  }
};