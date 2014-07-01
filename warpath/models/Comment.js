var mongoose      = require('mongoose')
    , Schema      = mongoose.Schema
    , User        = require('./User')

var commentSchema = new mongoose.Schema({
    body        : String
  , timestamp   : Number
  , createdAt   : Date

  , _creator    : { type: Schema.Types.ObjectId, ref: 'User' }

});

module.exports = mongoose.model('Comment', commentSchema);