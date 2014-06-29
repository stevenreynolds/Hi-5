var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');

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
 * GET /account/import/vimeo
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
 * GET /account/import/youtube
 */
exports.importYoutube = function(req, res) {
  youtubeController.getYoutube(req, res, function(data){
    //If no Video
    if(data.length === 0){
      req.flash('errors', { msg: 'No Video to import' });
      return res.redirect('/account/import');
    }

    //data = _.map(_.sortBy(data, 'stats.plays'), _.values);

    res.render('account/import_list', {
      title: 'Import from YouTube',
      data: data
    });

  });
};

/**
 * POST /account/import/vimeo
 */
exports.importSelected = function(req, res) {
  var temp = req.body.video.split("_");
  var platform = temp[1];

  var videos = req.body.video;

  console.log('importSelected')
  console.log(req.body)

  User.findById(req.user.id, function(err, user) {

    var Video = mongoose.model('Video', Video);
    var v = new Video();
    
    v._creator = user._id;
    v._id = req.body.video;
    v.platform = platform;

    v.save(function (err) {
      if(err) console.log(err)

        // Video
        // .findOne({ platform: 'vimeo' })
        // .populate('_creator')
        // .exec(function (err, story) {
        //   if (err) console.log(err);
        //   console.log('The creator is %s', story._creator.email);
        //   // prints "The creator is Aaron"
        // })

    });

    user.videos.push(v);
    user.save();

    VideoData
      .find({
        '_id': { $in: [
            videos
        ]}
      })
      .lean()
      .exec(function(err, docs){
      
      res.render('account/import_modify', {
        title: 'Add Data',
        data: docs
      });

    });


  });

  //res.send('ok')
};


/**
 * POST /account/import_complete
 */
exports.importComplete = function(req, res) {
  console.log(req.body);
  
  var locations = JSON.parse(req.body.locations);

  console.log(locations);

  locations.forEach(function(data) { 
    var videoID = data.id;

    Video.update({_id: videoID}, {
        location: {lat: data.lat, lng: data.lng} 
    }, function(err, numberAffected, rawResponse) {
        if(err) console.log(err)

        //req.flash('success', { msg: 'Videos imported!' });
        return res.redirect('/account');
    })
      
  });

};
