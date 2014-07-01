var secrets = require('../config/secrets');
var User = require('../models/User');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Mandrill',
  auth: {
    user: secrets.mandrill.user,
    pass: secrets.mandrill.password
  }
});

/**
 * GET /contact
 * Contact form page.
 */

exports.getContact = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 * @param email
 * @param name
 * @param message
 */

exports.postContact = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  var from = req.body.email;
  var name = req.body.name;
  var body = req.body.message;
  var to = 'talkto.hi5@gmail.com';
  var subject = 'Contact Form | WRPTH';

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body
  };

  smtpTransport.sendMail(mailOptions, function(err) {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.redirect('/contact');
    }
    req.flash('success', { msg: 'Merci pour ton message, on va voir ça dès que possible !' });
    res.redirect('/contact');
  });
};


/**
 * POST /contact_user
 * Send a contact form via Nodemailer.
 * @param email
 * @param name
 * @param message
 */

exports.postContactUser = function(req, res) {
  req.assert('message', 'Les messages vide j\'aime pas ça !').notEmpty();
  var fromUrl = req.body.fromUrl;

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(fromUrl);
  }

  var from = req.user.email;
  var to = req.body.to;
  var name = req.user.profile.name
  var subject = 'Tu as un message de ' + name + ' sur WarPath.com';
  var body = 'Tu as reçu un message sur WarPath de ' + name + "( " + from + " ) : \n";
  body += req.body.message;

  User.findById(to, function(err, user){
    var emailTo = user.email;

    var mailOptions = {
      to: emailTo,
      from: 'contact@wrpth.com',
      subject: subject,
      text: body
    };

    smtpTransport.sendMail(mailOptions, function(err) {
      if (err) {
        req.flash('errors', { msg: err.message });
        return res.redirect(fromUrl);
      }
      req.flash('success', { msg: 'On vient de lui envoyer ton message !' });
      res.redirect(fromUrl);
    });

  })


};

