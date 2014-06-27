var _ = require('lodash');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');

/**
 * GET /search?term=*
 * Search page.
 */
exports.search = function(req, res) {
    var type = req.query["type"];
    var regex = new RegExp(req.query["term"], 'i');

    if(type == 'User'){
        var query = User.find({'profile.name': regex}, { '_id': 0, 'profile': 1 }).limit(20);
    }
    else if(type == 'Video'){
        var query = VideoData.find({'name': regex}).limit(20);
    }

    // Execute query in a callback and return users list
    query.exec(function(err, data) {

        if (err) {
         res.send(JSON.stringify(err), {
            'Content-Type': 'application/json'
         }, 404);
        } 

         console.log(data)

         res.send(data, {
            'Content-Type': 'application/json'
         }, 200);
   
    });


};