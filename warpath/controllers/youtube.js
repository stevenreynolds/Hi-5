var Youtube = require("youtube-api");
var async = require("async");
var secrets = require('../config/secrets');
var _ = require('lodash');
var mongoose = require('mongoose');
var TokenProvider = require('refresh-token');

var User = require('../models/User');
var commentSchema = require('../models/Comment');
var videoSchema = require('../models/Video');
var videodataSchema = require('../models/VideoData');

exports.getYoutube = function(callback) {

    var token = _.find(req.user.tokens, { kind: 'google' });

    var GoogleTokenProvider = require('refresh-token').GoogleTokenProvider;

    var tokenProvider = new GoogleTokenProvider({
        refresh_token: token.refreshToken, 
        client_id:     secrets.google.clientID, 
        client_secret: secrets.google.clientSecret
      });

    tokenProvider.getToken(function (err, newToken) {
        if (err) {
            console.log(err);
        }
        else {

            User.findById(req.user.id, function(err, user) {
              user.tokens.push({ kind: 'google', accessToken: newToken, refreshToken:token.refreshToken, expires_in:3600 });
              
              user.save(function(err) {
                 if(err) console.log(err);
              });
           });
        
            var videos = [];

            Youtube.authenticate({
                type: "oauth",
                token: newToken
            });

            Youtube.channels.list({
                "part": "id,contentDetails",
                "mine": true
                //"maxResults": 50
            }, function (err, data) {
                if(err) console.log(err);

                var uploadsId = data.items[0].contentDetails.relatedPlaylists.uploads;
                console.log("uploadsId " + uploadsId)

                Youtube.playlistItems.list({
                    "part": "id,snippet,status",
                    "playlistId": uploadsId
                }, function (err, data) {
                    if(err) console.log(err);

                    //console.log(JSON.stringify(data))

                    async.each(data.items, function( video, callback ) {
                        var videoId = video.snippet.resourceId.videoId;

                        Youtube.videos.list({
                            "part": "id,snippet,contentDetails,fileDetails,player,processingDetails,recordingDetails,statistics,status,suggestions,topicDetails",
                            "id": videoId
                        }, function (err, data) {
                            console.log(err, data);
                            
                            data.items.forEach(function(data) { 
                                videos.push(data)

                                var Video = mongoose.model('Video', videoSchema);
                                var v = new Video();
                                
                                v.id = data.id;
                                v.platform = 'youtube';

                                v.save(function (err) {
                                  if(err) console.log(err)
                                });


                                var VideoData = mongoose.model('VideoData', videodataSchema);
                                var vd = new VideoData(data);

                                vd.save(function (err) {
                                  if(err) console.log(err)
                                });


                            });

                            callback();
                        });

                    }, function(err){
                        if( err ) {
                          console.log(err);
                        } else {

                          console.log('All videos have been processed successfully');
                          callback(videos)
                        }
                    });

                    
                });

            });



        }
    });



    // https://developers.google.com/youtube/v3/docs/videos/list
    // id,snippet,contentDetails,fileDetails,player,processingDetails,recordingDetails,statistics,status,suggestions,topicDetails
    // GET https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet%2CcontentDetails%2CfileDetails%2Cplayer%2CprocessingDetails%2CrecordingDetails%2Cstatistics%2Cstatus%2Csuggestions%2CtopicDetails&id=KlhAjqtmEC8&key={YOUR_API_KEY}

};
