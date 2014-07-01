var mongoose      = require('mongoose')
    , Schema      = mongoose.Schema
    , VideoData   = require('./Video');

var videodataSchema = new mongoose.Schema({
  _id       : String,
  id        : String,
  _video    : { type: String, ref: 'Video' },
}, { strict: false });

module.exports = mongoose.model('VideoData', videodataSchema);