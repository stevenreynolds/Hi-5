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

   var regex = new RegExp(req.query["term"], 'i');
   var query = User.find({'profile.name': regex}, { '_id': 0, 'profile': 1 }).limit(20);
        
    // Execute query in a callback and return users list
    query.exec(function(err, users) {

        if (err) {
         res.send(JSON.stringify(err), {
            'Content-Type': 'application/json'
         }, 404);
        } 

        // Method to construct the json result set
         var result = users;
         console.log(result)

         res.send(result, {
            'Content-Type': 'application/json'
         }, 200);
   
   });


};