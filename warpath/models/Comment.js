var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    body  : String
  , createdAt  : Date
  , timestamp : Number
});

module.exports = mongoose.model('Comment', commentSchema);