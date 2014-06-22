var mongoose = require('mongoose');
var commentSchema = require('./Comment').schema;

var videoSchema = new mongoose.Schema({
  id: { type: String, unique: true, lowercase: true },
  platform: String,

  comments  : [commentSchema],

  importedAt: Date,
  modifiedAt: Date
});

module.exports = mongoose.model('Video', videoSchema);