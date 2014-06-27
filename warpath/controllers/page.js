/**
 * GET /legal-notice
 * 
 */

exports.legalNotice = function(req, res) {
  res.render('mentions-legales', {
    title: 'Legal Notice'
  });
};

