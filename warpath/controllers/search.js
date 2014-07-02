var _ = require('lodash');

var mongoose = require('mongoose');
var User = require('../models/User');
var Video = require('../models/Video');
var VideoData = require('../models/VideoData');

/**
 * GET /search?term=*&type=
 * Search page.
 */
exports.search = function(req, res) {
    var type = req.query["type"];
    var regex = new RegExp(req.query["term"], 'i');

    if(type == 'User'){
        var find = { $or: [ {'profile.name': regex}, {'profile.slug': regex} ] };
        var query = User.find(find, { '_id': 0, 'profile': 1 }).limit(20);
    }
    else if(type == 'Video'){
        var find = { $or: [ { 'name': regex }, { 'snippet.title': regex } ] };
        var query = VideoData.find(find).limit(20);
    }

    query.exec(function(err, data) {

        if (err) {
         res.send(JSON.stringify(err), {
            'Content-Type': 'application/json'
         }, 404);
        } 

        res.send(data, {
            'Content-Type': 'application/json'
        }, 200);
   
    });


};