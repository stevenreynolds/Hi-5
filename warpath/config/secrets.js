/**
 * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT * IMPORTANT *
 *
 * You should never commit this file to a public repository on GitHub!
 * All public code on GitHub can be searched, that means anyone can see your
 * uploaded secrets.js file.
 *
 * I did it for your convenience using "throw away" credentials so that
 * all features could work out of the box.
 *
 * Untrack secrets.js before pushing your code to public GitHub repository:
 *
 * git rm --cached config/secrets.js
 *
 * If you have already commited this file to GitHub with your keys, then
 * refer to https://help.github.com/articles/remove-sensitive-data
*/

var development = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || '!b17e$@^shg#+o$34c32x-lo^!%z02_&ffmj-fcpce8pc%@&@^',

  mailgun: {
    user: process.env.MAILGUN_USER || 'postmaster@sandbox697fcddc09814c6b83718b9fd5d4e5dc.mailgun.org',
    password: process.env.MAILGUN_PASSWORD || '29eldds1uri6'
  },
  
  mandrill: {
    user: process.env.MANDRILL_USER || 'joel.galeran+hi5@gmail.com',
    password: process.env.MANDRILL_PASSWORD || 'THS23nA89LkooF9tXIrsSw'
  },

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || '1444959329093692',
    clientSecret: process.env.FACEBOOK_SECRET || '3d94ac73bfef0818fe3215e62ae66f57',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  instagram: {
    clientID: process.env.INSTAGRAM_ID || '0046d253f3e2482ca24f22c65a4ef016',
    clientSecret: process.env.INSTAGRAM_SECRET || '58ca6fdf09c44b928dd3b2124eecea69',
    callbackURL: '/auth/instagram/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY || 'caK4z7QF8m01u5XUHRyqNVPJW',
    consumerSecret: process.env.TWITTER_SECRET  || 'CJLMSYIBVXymXuV3hJYx8pfJrkfRDWGEldptbKAwBjtLnWktzr',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    clientID: process.env.GOOGLE_ID || '538310333639-pbh65gem1spfkn6t4udl1mdrneibhgtn.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'ivf18MisSAwsQZH6GyPw0hgt',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  vimeo: {
    consumerKey: process.env.VIMEO_ID || '3d350c9960a700cdfb619f5d77fe5a7fb29b281d',
    consumerSecret: process.env.VIMEO_SECRET || '9279513670fb60061d48fa50e4228b36b3fde4c3',

    clientID: process.env.VIMEO_ID || '3d350c9960a700cdfb619f5d77fe5a7fb29b281d',
    clientSecret: process.env.VIMEO_SECRET || '9279513670fb60061d48fa50e4228b36b3fde4c3',

    redirectUrl: '/auth/vimeo/callback',
    callbackURL: '/auth/vimeo/callback',
    passReqToCallback: true
  },


  foursquare: {
    clientId: process.env.FOURSQUARE_ID || '2STROLSFBMZLAHG3IBA141EM2HGRF0IRIBB4KXMOGA2EH3JG',
    clientSecret: process.env.FOURSQUARE_SECRET || 'UAABFAWTIHIUFBL0PDC3TDMSXJF2GTGWLD3BES1QHXKAIYQB',
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL || 'http://localhost:3000/auth/foursquare/callback'
  },

};


var beta = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || '!b17e$@^shg#+o$34c32x-lo^!%z02_&ffmj-fcpce8pc%@&@^',

  mailgun: {
    user: process.env.MAILGUN_USER || 'postmaster@sandbox697fcddc09814c6b83718b9fd5d4e5dc.mailgun.org',
    password: process.env.MAILGUN_PASSWORD || '29eldds1uri6'
  },
  
  mandrill: {
    user: process.env.MANDRILL_USER || 'joel.galeran+hi5@gmail.com',
    password: process.env.MANDRILL_PASSWORD || 'THS23nA89LkooF9tXIrsSw'
  },

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || '1444959329093692',
    clientSecret: process.env.FACEBOOK_SECRET || '3d94ac73bfef0818fe3215e62ae66f57',
    callbackURL: 'http://beta.wrpth.com/auth/facebook/callback',
    passReqToCallback: true
  },

  instagram: {
    clientID: process.env.INSTAGRAM_ID || 'f670b0b4f957496cbfe3a3feef3d5fe3',
    clientSecret: process.env.INSTAGRAM_SECRET || 'ee857e4e2aa145a8b9e86a035543b2fc',
    callbackURL: 'http://beta.wrpth.com/auth/instagram/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY || 'caK4z7QF8m01u5XUHRyqNVPJW',
    consumerSecret: process.env.TWITTER_SECRET  || 'CJLMSYIBVXymXuV3hJYx8pfJrkfRDWGEldptbKAwBjtLnWktzr',
    callbackURL: 'http://beta.wrpth.com/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    clientID: process.env.GOOGLE_ID || '538310333639-u9qkn7ej4s9kv4fri3jrbsghpo69kjhn.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'EqidctuY0D_m4m4hFGwfRFUk',
    callbackURL: 'http://beta.wrpth.com/auth/google/callback',
    passReqToCallback: true
  },

  vimeo: {
    consumerKey: process.env.VIMEO_ID || 'b8ee7e5bce433c38cfa2a5fdce394b28947f0a78',
    consumerSecret: process.env.VIMEO_SECRET || '19f27b0df64c0bb53a3a619214688424501ea510',

    clientID: process.env.VIMEO_ID || 'b8ee7e5bce433c38cfa2a5fdce394b28947f0a78',
    clientSecret: process.env.VIMEO_SECRET || '19f27b0df64c0bb53a3a619214688424501ea510',

    redirectUrl: 'http://beta.wrpth.com/auth/vimeo/callback',
    callbackURL: 'http://beta.wrpth.com/auth/vimeo/callback',
    passReqToCallback: true
  },

  foursquare: {
    clientId: process.env.FOURSQUARE_ID || '2STROLSFBMZLAHG3IBA141EM2HGRF0IRIBB4KXMOGA2EH3JG',
    clientSecret: process.env.FOURSQUARE_SECRET || 'UAABFAWTIHIUFBL0PDC3TDMSXJF2GTGWLD3BES1QHXKAIYQB',
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL || 'http://localhost:3000/auth/foursquare/callback'
  },

}

console.log(process.env.NODE_ENV)
switch(process.env.NODE_ENV){
    case 'development': module.exports = development; break;
    case 'production':  module.exports = beta;        break;
    case 'beta':        module.exports = beta;        break;
    default:            module.exports = development;
}
