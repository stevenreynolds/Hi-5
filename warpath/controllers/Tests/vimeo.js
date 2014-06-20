var Vimeo = require('vimeo-api').Vimeo;
var async = require("async");
var secrets = require('../config/secrets');

// Your client_id and client_secret can be found on your app page under OAuth 2.
// If you do not have an api app, you can create one at https://developer.vimeo.com/api/apps
var lib = new Vimeo(secrets.vimeo.consumerKey, secrets.vimeo.consumerSecret);

var scopes = "public";
//lib.access_token = "c1094fe4f480f60ae07233ad53127e8c";
lib.access_token = "d0e78b824f1882b254d378a52054386c";


lib.request(/*options*/{
    path : '/me/videos',
    query : {
        page : 1,
        per_page : 100
    }
}, /*callback*/function (error, body, status_code, headers) {
    if (error) {
        console.log('error');
        console.log(error);
    } else {
        console.log('body');
        console.log(body);
    }

    console.log('status code');
    console.log(status_code);
    console.log('headers');
    console.log(headers);


    async.each(body.data, function( video, callback ) {
        var videoId = video.uri.replace('/videos/','')

        lib.request(/*options*/{
                path : '/videos/'+videoId,
            }, /*callback*/function (error, body, status_code, headers) {
                if (error) {
                    console.log('error');
                    console.log(error);
                } else {
                    console.log('body');
                    console.log(body);
                    callback();
                }

                console.log('status code');
                console.log(status_code);
                console.log('headers');
                console.log(headers);
        });

    }, function(err){
        if( err ) {
          console.log(err);
        } else {
          console.log('All videos have been processed successfully');
        }
    });


});
