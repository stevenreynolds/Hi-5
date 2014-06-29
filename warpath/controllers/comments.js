var _ = require('lodash');
var async = require('async');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');

var moment = require('moment');
moment.lang('fr');


/**
 * GET /comments/:id
 * Comments Video.
 */
exports.getComments = function(req, res) {
  var videoID = req.params.id;

  Video
    .findOne({'_id': {'$regex': videoID} })
    .exec(function (err, video) {
      if (err) console.log(err);

      if(video)
        res.send(video.comments);
      else
        res.send([]);
    })

};


/**
 * POST /comments
 * Comments Video.
 */
exports.addComment = function(req, res) {
  var comment = req.body;
  var videoID = comment.id;

  if(!videoID)
    return res.send({'error':'No Video ID'});

  if(req.user && req.user.id)
    console.log(req.user.id)

  comment = {
    body      : comment.body,
    timestamp : comment.timestamp,
  }

  // req.assert('videoID', 'VideoID empty').notEmpty();
  // req.assert('comment', 'Comment empty').notEmpty();

  // var errors = req.validationErrors();

  // if (errors) {
  //   return res.send(errors);
  // }

  Video
    .findOne({'_id': {'$regex': videoID} })
    .exec(function (err, video) {
      if (err) console.log(err);

      if(video){
        video.comments.push(comment);

        video.save(function(err) {
          if (err) console.log(err);
        })

        console.log(video);

        res.send(video)
        
      } else{
        res.send({'error':'No Video Found'})
      }
    })
  
};