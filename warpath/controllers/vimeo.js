var Vimeo           = require('vimeo-api').Vimeo;
var async           = require("async");
var secrets         = require('../config/secrets');
var _               = require('lodash');
var mongoose        = require('mongoose');
var User            = require('../models/User');
var commentSchema   = require('../models/Comment');
var videoSchema     = require('../models/Video');
var VideoData       = require('../models/VideoData');

exports.getVimeo = function(req, res, callback) {

    var token = _.find(req.user.tokens, { kind: 'vimeo' });

    // Your client_id and client_secret can be found on your app page under OAuth 2.
    // If you do not have an api app, you can create one at https://developer.vimeo.com/api/apps
    var lib = new Vimeo(secrets.vimeo.consumerKey, secrets.vimeo.consumerSecret);

    var scopes = "public";
    lib.access_token = token.accessToken;

    lib.request({
        path : '/me/videos',
        query : {
            page : 1,
            per_page : 100
        }
    }, function (err, body, status_code, headers) {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
            var videos = [];

            async.each(body.data, function( video, callback ) {
                var videoId = video.uri.replace('/videos/','')

                lib.request({
                        path : '/videos/'+videoId,
                    }, function (err, body, status_code, headers) {
                        if (err) {
                            console.log(err);
                        } else {

                            videos.push(body)

                            var vd = new VideoData(body);
                            vd._id          = 'vimeo_' + videoId;
                            vd._video       = 'vimeo_' + videoId;
                            
                            vd.save(function (err) {
                              if(err) console.log(err)
                            });
                            
                            callback();
                        }
                });

            }, function(err){
                if( err ) {
                  console.log(err);
                } else {
                  console.log('All videos have been processed successfully');
                  callback(videos)
                }
            });

        }

    });

};
