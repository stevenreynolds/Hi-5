var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');

var User = require('../models/User');

var secrets = require('../config/secrets');

var youtubeController = require('./youtube');
var vimeoController = require('./vimeo');


/**
 * GET /account/import
 * Import page.
 */
exports.importVideos = function(req, res) {
  res.render('account/import', {
    title: 'Import'
  });
};

/**
 * GET /account/import/Vimeo
 *  page.
 */
exports.importVimeo = function(req, res) {
  res.render('account/import/vimeo', {
    title: 'Import from Vimeo'
  });
};

/**
 * GET /account/import/YouTube
 *  page.
 */
exports.importYoutube = function(req, res) {
  res.render('account/import/youtube', {
    title: 'Import from YouTube'
  });
};