var mongoose = require('mongoose');

var videodataSchema = new mongoose.Schema({
  id: { type: String, unique: true, lowercase: true },
}, { strict: false });

module.exports = mongoose.model('VideoData', videodataSchema);