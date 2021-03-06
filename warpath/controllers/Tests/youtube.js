var Youtube = require("youtube-api");
var async = require("async");

Youtube.authenticate({
    type: "oauth",
    token: "ya29.LgDF7GxAyaJ0NhkAAAAta2z3MM7Q1OS_RGGeetv8EGNdscpVLA-eaTI1wZxNrA"
});

Youtube.channels.list({
    "part": "id,contentDetails",
    "mine": true
    //"mySubscribers": true,
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
                callback();
            });

        }, function(err){
            if( err ) {
              console.log(err);
            } else {
              console.log('All videos have been processed successfully');
            }
        });

        
    });

});



// https://developers.google.com/youtube/v3/docs/videos/list
// id,snippet,contentDetails,fileDetails,player,processingDetails,recordingDetails,statistics,status,suggestions,topicDetails
// GET https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet%2CcontentDetails%2CfileDetails%2Cplayer%2CprocessingDetails%2CrecordingDetails%2Cstatistics%2Cstatus%2Csuggestions%2CtopicDetails&id=KlhAjqtmEC8&key={YOUR_API_KEY}


