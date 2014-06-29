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
 * POST /account/import/vimeo || /account/import/youtube
 */
exports.importSelected = function(req, res) {
  var videos = req.body.videos;
  if(videos)
    videos = JSON.parse(videos);
  //if(videos.length == 0) res.redirect('/');

  console.log('importSelected')
  console.log(req.body)

  User.findById(req.user.id, function(err, user) {

    var Video = mongoose.model('Video', Video);

    console.log(videos)
    console.log('_________________________-----------------_________________________')


    async.eachSeries(videos, function( lavideo, callback) {

      console.log(lavideo)

      var temp = lavideo.split("_");
      var platform = temp[0];

      var v = new Video();
      
      v._id = lavideo;
      v.id = lavideo;
      //v.id = temp[1];
      v._creator = user._id;
      v.platform = platform;

      console.log(v)

      v.save(function (err) {
        if(err) console.log(err)
          console.log('++++++++++++++++++++++++++++++++++++++++++++++')

        user.videos.push(v);
        callback();

          // Video
          // .findOne({ platform: 'vimeo' })
          // .populate('_creator')
          // .exec(function (err, story) {
          //   if (err) console.log(err);
          //   console.log('The creator is %s', story._creator.email);
          //   // prints "The creator is Aaron"
          // })

      });
    }, function(err){
        // if any of the file processing produced an error, err would equal that error
        if( err ) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A file failed to process');
        } else {

          user.save();
          console.log('All files have been processed successfully');
        }
    });

    console.log(videos)

    VideoData
      .find({
        '_id': { $in: videos }
      })
      .lean()
      .exec(function(err, docs){
        if(err) console.log(err)


      var videos_data = [];

      console.log('----------------------------docs----------------------------------------------')
      console.log(videos)
      console.log(docs)
      console.log('----------------------------docs----------------------------------------------')


      _(docs).forEach(function(video) { 

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

      console.log('----------------------------videos_data----------------------------------------------')
      console.log(videos_data)
      console.log('----------------------------videos_data----------------------------------------------')

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

  _(locations).forEach(function(data) { 

    var videoID = data.id;

    Video.update({_id: videoID}, {
        location: {lat: data.lat, lng: data.lng} 
    }, function(err, numberAffected, rawResponse) {
        if(err) console.log(err)
    })

    //req.flash('success', { msg: 'Videos imported!' });
    return res.redirect('/account');
      
  });

};
