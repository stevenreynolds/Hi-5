var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');

var secrets = require('../config/secrets');

var youtubeController = require('./youtube');
var vimeoController = require('./vimeo');


/**
 * GET /account/import
 * Import page.
 */
exports.importVideos = function(req, res) {
  res.render('account/import', {
    title: 'Import your Videos!'
  });
};

/**
 * GET /account/import/Vimeo
 *  page.
 */
exports.importVimeo = function(req, res) {
  vimeoController.getVimeo(req, res, function(data){
    //If no Video
    if(data.length === 0){
      req.flash('errors', { msg: 'No Video to import' });
      return res.redirect('/account/import');
    }

    //data = _.map(_.sortBy(data, 'stats.plays'), _.values);

    res.render('account/import_list', {
      title: 'Import from Vimeo',
      data: data
    });

  });
};

/**
 * GET /account/import/YouTube
 *  page.
 */
exports.importYoutube = function(req, res) {
  res.render('account/import/youtube', {
    title: 'Import from YouTube'
  });
};


/**
 * GET /account/import/YouTube
 *  page.
 */
exports.importSelected = function(req, res) {
  var videos = req.body.video;

  console.log(req.body)

  User.findById(req.user.id, function(err, user) {

    var Video = mongoose.model('Video', Video);
    var v = new Video();
    
    v._creator = user._id;
    v._id = req.body.video;
    v.platform = 'vimeo';

    v.save(function (err) {
      if(err) console.log(err)

        Video
        .findOne({ platform: 'vimeo' })
        .populate('_creator')
        .exec(function (err, story) {
          if (err) return handleError(err);
          console.log('The creator is %s', story._creator.email);
          // prints "The creator is Aaron"
        })
    });

    user.videos.push(v);
    user.save();


    

  //   user.videos.push({ 
  //     id: videos,
  //     platform: 'test'
  //   });

  //   user.save(function(err) {
  //     if (err) console.log(err);

  //     res.render('account/import_modify', {
  //       title: 'Add Data'
  //     });
  //   });

  });

  



  //res.send('ok')
};
