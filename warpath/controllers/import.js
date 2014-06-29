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
  vimeoController.getVimeo(req, res, function(videos){
    //If no Video
    if(videos.length === 0){
      req.flash('errors', { msg: 'No Video to import' });
      return res.redirect('/account/import');
    }

    var data = {
      title: 'Import from Vimeo',
      videos: []
    }

    videos.forEach(function(video) { 
      var videoID = video.uri.replace('/videos/', '');
      var video = {
          id:           videoID
        , platform:     'vimeo'
        , link:         video.link
        , title:        video.name
        , description:  video.description
        , image:        video.pictures[5].link
      }
      data.videos.push(video);
    });

    res.render('account/import_list', data);

  });
};

/**
 * GET /account/import/youtube
 */
exports.importYoutube = function(req, res) {
  youtubeController.getYoutube(req, res, function(videos){
    //If no Video
    if(videos.length === 0){
      req.flash('errors', { msg: 'No Video to import' });
      return res.redirect('/account/import');
    }

    //video = _.map(_.sortBy(video, 'stats.plays'), _.values);
    console.log('____________________________________________________________')
    console.log(videos)
    console.log('____________________________________________________________')


    var data = {
      title: 'Import from YouTube',
      videos: []
    }

    videos.forEach(function(video) { 
      var video = {
          id:           video.id
        , platform:     'youtube'
        , link:         'http://youtu.be/' + video.id
        , title:        video.snippet.title
        , description:  video.snippet.description
        , image:        'http://img.youtube.com/vi/' + video.id + '/default.jpg'
      }
      data.videos.push(video);
    });

    res.render('account/import_list', data);

  });
};

/**
 * POST /account/import/vimeo
 */
exports.importSelected = function(req, res) {
  var videos = req.body.video;

  console.log('importSelected')
  console.log(req.body)

  User.findById(req.user.id, function(err, user) {

    var Video = mongoose.model('Video', Video);

    videos.forEach(function(video) { 

      var temp = video.split("_");
      var platform = temp[0];

      var v = new Video();
      
      v._creator = user._id;
      v._id = video;
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

    });

    user.save();

    console.log(videos)

    VideoData
      .find({
        '_id': { $in: videos }
      })
      .lean()
      .exec(function(err, docs){

      var videos_data = [];
      docs.forEach(function(video) { 

        console.log('fffffffffffffffffffffffffffffffff')
        console.log(video)

        var temp = video._id.split("_");
        var platform = temp[0];

        console.log(platform)


        if(platform == 'youtube'){
          var video = {
              id:           video.id
            , platform:     'youtube'
            , link:         'http://youtu.be/' + video.id
            , title:        video.snippet.title
            , description:  video.snippet.description
            , image:        'http://img.youtube.com/vi/' + video.id + '/default.jpg'
          }
        }

        if(platform == 'vimeo'){
          var videoID = video.uri.replace('/videos/', '');
          var video = {
              id:           videoID
            , platform:     'vimeo'
            , link:         video.link
            , title:        video.name
            , description:  video.description
            , image:        video.pictures[5].link
          }
        }

        videos_data.push(video);
      });

      
      res.render('account/import_modify', {
        title: 'Add Data',
        data: videos_data
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
