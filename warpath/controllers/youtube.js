var Youtube = require("youtube-api");
var async = require("async");
var secrets = require('../config/secrets');
var _ = require('lodash');
//var refresh = require('google-token-refresh');

exports.getYoutube = function(req, res, callback) {

    var token = _.find(req.user.tokens, { kind: 'google' });

    // refresh(refreshToken, secrets.google.clientID, secrets.google.clientSecret, function (err, json, res) {
    //   if (err) return handleError(err);
    //   if (json.error) return handleError(new Error(res.statusCode + ': ' + json.error));

    //   var newAccessToken = json.accessToken;
    //   if (! accessToken) {
    //     return handleError(new Error(res.statusCode + ': refreshToken error'));
    //   }
    //   var expireAt = new Date(+new Date + parseInt(json.expiresIn, 10));
    //   handleRefreshedData(newAccessToken, expireAt);
    // });

    console.log(token.accessToken)

    Youtube.authenticate({
        type: "oauth",
        token: token.accessToken
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

            var videos = [];

            async.each(data.items, function( video, callback ) {
                var videoId = video.snippet.resourceId.videoId;

                Youtube.videos.list({
                    "part": "id,snippet,contentDetails,fileDetails,player,processingDetails,recordingDetails,statistics,status,suggestions,topicDetails",
                    "id": videoId
                }, function (err, data) {
                    console.log(err, data);
                    
                    data.items.forEach(function(video) { 
                        videos.push(video)
                    });

                    callback();
                });

            }, function(err){
                if( err ) {
                  console.log(err);
                } else {

                  console.log('All videos have been processed successfully');
                  res.send(videos)
                }
            });

            
        });

    });



    // https://developers.google.com/youtube/v3/docs/videos/list
    // id,snippet,contentDetails,fileDetails,player,processingDetails,recordingDetails,statistics,status,suggestions,topicDetails
    // GET https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet%2CcontentDetails%2CfileDetails%2Cplayer%2CprocessingDetails%2CrecordingDetails%2Cstatistics%2Cstatus%2Csuggestions%2CtopicDetails&id=KlhAjqtmEC8&key={YOUR_API_KEY}

};
