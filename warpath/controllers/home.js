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

    videos.forEach(function(data) {

        var point = {
            type: 'Feature',
            properties: {
                title: data._video_data.name,
                url: '/video/' + data._id.replace('vimeo_','').replace('youtube_',''),
                type: 'water',
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
