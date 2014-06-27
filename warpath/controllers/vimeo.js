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
    }, function (error, body, status_code, headers) {
        if (error) {
            console.log('error');
            console.log(error);
            res.send(error)
        } else {
            // console.log('body');
            // console.log(body);

            // console.log('status code');
            // console.log(status_code);
            // console.log('headers');
            // console.log(headers);
        

            var videos = [];

            async.each(body.data, function( video, callback ) {
                var videoId = video.uri.replace('/videos/','')

                lib.request({
                        path : '/videos/'+videoId,
                    }, function (error, body, status_code, headers) {
                        if (error) {
                            console.log('error');
                            console.log(error);
                        } else {
                            console.log('body');
                            console.log(body);

                            videos.push(body)

                            // var Video = mongoose.model('Video', videoSchema);
                            // var v = new Video();
                            
                            // v.id = videoId
                            // v.platform = 'vimeo';

                            // v.save(function (err) {
                            //   if(err) console.log(err)
                            // });

                            var vd = new VideoData(body);
                            vd._id          = 'vimeo_' + videoId;
                            
                            vd.save(function (err) {
                              if(err) console.log(err)
                            });
                            
                            callback();

                            // console.log('status code');
                            // console.log(status_code);
                            // console.log('headers');
                            // console.log(headers);
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
