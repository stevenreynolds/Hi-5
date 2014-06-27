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

      if(video.platform == 'vimeo'){
        console.log(video._video_data.created_time)
        var date = moment(video._video_data.created_time)
      } else {

      }
      //console.log(video);

      res.render('video', {
        title: 'Video',
        video: video,
        date: date.format('DD MMM YYYY')
      });

    })
  
};


generateGeoJSON = function(videos, callback){
    var geoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    videos.forEach(function(data) {

        var point = {
            type: 'Feature',
            properties: {
                title: data._video_data.name,
                url: data._video_data.link,
                type: 'snow',
            },
            geometry: {
                type: 'Point',
                coordinates: [data.location.lng, data.location.lat]
            }
        }

        geoJSON.features.push(point);

    });

    console.log(geoJSON.features)

    callback(geoJSON);

}
