var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/Sitemap.xml', function(req, res) {
	res.set('Content-Type', 'text/xml');
	res.sendfile('Sitemap.xml');
});

router.get('*', function(req, res) {
  res.render('index', { title: 'MovieHunter' });
});

module.exports = router;
