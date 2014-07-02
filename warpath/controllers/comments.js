var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
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
    .populate('_creator')
    .lean()
    .exec(function (err, video) {
      if (err) console.log(err);

      var oldComments = video.comments;
      var comments = [];

      oldComments.forEach(function(comment){
        var md5 = crypto.createHash('md5').update(video._creator.email).digest('hex');
        comment.image = 'https://gravatar.com/avatar/' + md5 + '?s=' + 200 + '&d=retro';
        
        comments.push(comment);
      })

      if(video)
        res.send(comments);
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

  if(!req.user || !req.user.id)
    return res.send({'error':'No User ID'});

  comment = {
    body      : comment.body,
    timestamp : comment.timestamp,
    _creator  : req.user.id
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

        res.send(video)

      } else{
        res.send({'error':'No Video Found'})
      }
    })
  
};