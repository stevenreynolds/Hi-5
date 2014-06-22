var mongoose = require('mongoose');

var videodataSchema = new mongoose.Schema({
  _id       : String,
  id        : String,
}, { strict: false });

module.exports = mongoose.model('VideoData', videodataSchema);