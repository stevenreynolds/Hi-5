var mongoose      = require('mongoose')
    , Schema      = mongoose.Schema;

var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Video = require('./Video');

var slug = require('slug');
var request = require('request');
var async = require('async');

var userSchema = new mongoose.Schema({
  email       : { type: String, unique: true, lowercase: true },
  password    : String,

  facebook    : String,
  twitter     : String,

  google: {
    id        : String,
    username  : String,
    channel   : String
  },
  instagram: {
    id        : String,
    username  : String
  },
  vimeo: {
    id        : String,
    username  : String
  },

  tokens      : Array,

  profile: {
    slug      : { type: String, unique: true },
    name      : { type: String, default: '' },
    gender    : { type: String, default: '' },
    location  : { type: String, default: '' },
    website   : { type: String, default: '' },
    picture   : { type: String, default: '' },

    city      : { type: String, default: '' },
    country   : { type: String, default: '' },
    birthdate : { type: Date,   default: Date.now },
    motivation: { type: Boolean, default: 0 },
    company   : { type: String, default: '' },
  },

  videos: [{ type: String, ref: 'Video' }],

  resetPasswordToken    : String,
  resetPasswordExpires  : Date,

  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now }
});

/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

userSchema.pre('save', function(next) {
  var user = this;

  user.generateSlug();

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(5, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Get URL to a user's gravatar.
 * Used in Navbar and Account Management page.
 */

userSchema.methods.gravatar = function(size) {
  if (!size) size = 200;

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }

  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

userSchema.methods.getPoints = function(cb) {
  var user = JSON.parse(JSON.stringify(this));

  var views = 0;
  var comments = 0;
  var share_total = 0;

  async.parallel([
      function(callback){
          
        var query = { _creator : user._id };
        Video
          .find(query)
          .populate('_video_data')
          .lean()
          .exec(function(err, videos) {
          if (err) console.log(err);

          async.each(videos, function(video, callback_each) {
            var video_data = video._video_data;

            if(video.platform == 'youtube'){
              views += parseInt(video_data.statistics.viewCount);
              var link = 'http://youtu.be/' + video_data.id;
            }

            if(video.platform == 'vimeo'){
              views += parseInt(video_data.stats.plays);
              var link = video_data.link;
            }

            comments += video.comments.length;

            var request_url = "http://free.sharedcount.com?url=" + encodeURIComponent(link) + "&apikey=" + "22304c02dd7115798c72457b04754096961b81c6";

            request(request_url, function (err, response, body) {
              
              if (err) { console.log(err); }

              if (!err && response.statusCode == 200) {
                body = JSON.parse(body)

                share_total += body.StumbleUpon
                        + body.Reddit
                        + body.Facebook.total_count
                        + body.Delicious
                        + body.GooglePlusOne
                        + body.Twitter
                        + body.Diggs
                        + body.Pinterest
                        + body.LinkedIn;

                callback_each();
              } 

            });
            
          }, function(err){
              if( err ) {
                console.log(err);
                cb(0);
              } else {
                
                callback()
                
              }
          });

        });

      },
      function(callback){
          callback()
      }
  ],
  // optional callback
  function(err, results){
    if(err) console.log(err)
      
    var points = (views * 5) + share_total + (comments * 2);
    cb(points);
  });

};

userSchema.methods.generateSlug = function() {
  var user = this;
  if (user.profile && user.profile.name && !user.profile.slug) {

    var slugname = slug(user.profile.name);
    mongoose.model('User', userSchema)
      .count({ 'profile.slug': new RegExp('^' + slugname + '$', 'i') })
      .lean()
      .exec(function(err, count) {
      if (err) console.log(err);

      if(count == 0)
        user.profile.slug = slugname;
      else
        user.profile.slug = slugname + (count-1)

      user.save();

    });

  }

};

module.exports = mongoose.model('User', userSchema);
