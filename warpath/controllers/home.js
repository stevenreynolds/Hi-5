var _ = require('lodash');
var async = require('async');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');


/**
 * GET /
 * Home page with Videos.
 */

exports.index = function(req, res) {

  Video
    .find({})
    .lean() //Very Important !
    .populate('_video_data')
    .populate('_creator')
    .exec(function (err, videos) {
      if (err) console.log(err);

      //console.log(videos);
      generateGeoJSON(videos, function(geoJSON){
        
        res.render('home', {
            title: 'Home',
            geoJSON_videos: JSON.stringify(geoJSON)
        });

      })

    })
  
};


var generateGeoJSON = function(videos, callback){
    var geoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    _(videos).forEach(function(video) { 

        var temp = video._id.split("_");
        var platform = temp[0];
        var videoID = temp[1];

        console.log(video._id)

        if(platform == 'youtube'){
          var thevideo = {
              id:           videoID
            , platform:     'youtube'
            , link:         'http://youtu.be/' + videoID
            , title:        video._video_data.snippet.title
            , description:  video._video_data.snippet.description
            , image:        'http://img.youtube.com/vi/' + video.id + '/default.jpg'
          }
        }

        if(platform == 'vimeo'){
          var thevideo = {
              id:           videoID
            , platform:     'vimeo'
            , link:         video._video_data.link
            , title:        video._video_data.name
            , description:  video._video_data.description
            , image:        video._video_data.pictures[5].link
          }
        }

        var point = {
            type: 'Feature',
            properties: {
                title: thevideo.title,
                url: '/video/' + videoID,
                type: video.type,
            },
            geometry: {
                type: 'Point',
                coordinates: [video.location.lng, video.location.lat]
            }
        }

        geoJSON.features.push(point);

    });

    console.log(geoJSON.features)

    callback(geoJSON);

}
