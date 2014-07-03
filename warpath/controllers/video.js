var _ = require('lodash');
var async = require('async');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');

var moment = require('moment');
moment.lang('fr');

/**
 * GET /video/:id
 * Video.
 */
exports.getVideo = function(req, res) {
   var videoID = req.params.id;

  Video
    //.findOne({ _id: videoID })
    //not perfect but collision between vimeo id and youtube id will be rare like 1 in 1 billion
    .findOne({'_id': {'$regex': videoID} })
    .lean() //Very Important !
    .populate('_video_data')
    .populate('_creator')
    .exec(function (err, video) {
      if (err) console.log(err);
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
                , link:         'http://youtu.be/' + video.id
                , title:        video_data.snippet.title
                , description:  video_data.snippet.description
                , image:        'http://img.youtube.com/vi/' + video.id + '/default.jpg'
                , _creator:     video._creator
                , location:     video.location
                , likes:        likes
                , views:        views
                , date:         date
                , type:         video.type
            }
        }

        if(video.platform == 'vimeo'){
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
                , type:         video.type
            }
        }


      var isConnected = 0;
      if(req.user && req.user.id) isConnected = 1;
      
      res.render('video', {
        title: 'Video',
        video: video,
        isConnected: isConnected
      });

    })
  
};
