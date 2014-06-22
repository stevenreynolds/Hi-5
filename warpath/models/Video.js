var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var Comment  = require('./Comment').schema;
var User     = require('./User');

var videoSchema = new mongoose.Schema({
  _id       : String,
  id        : { type: String, unique: true, lowercase: true },
  platform  : String,

  _creator: { type: Schema.Types.ObjectId, ref: 'User' },

  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },

  comments: [Comment],

  importedAt: Date,
  modifiedAt: Date
});

module.exports = mongoose.model('Video', videoSchema);
