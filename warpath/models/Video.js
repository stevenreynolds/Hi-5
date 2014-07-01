var mongoose      = require('mongoose')
    , Schema      = mongoose.Schema
    , Comment     = require('./Comment').schema
    , User        = require('./User')
    , VideoData   = require('./VideoData');


var videoSchema = new mongoose.Schema({
  _id       : String,
  id        : { type: String, unique: true, lowercase: true },
  
  platform  : String,
  type      : String,

  _creator: { type: Schema.Types.ObjectId, ref: 'User' },
  _video_data: { type: String, ref: 'VideoData' },

  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },

  comments: [Comment],

  importedAt: Date,
  modifiedAt: Date
});


videoSchema.pre('save', function(next) {
  var video = this;
  video._video_data = video._id;
  
  next();
});


module.exports = mongoose.model('Video', videoSchema);
