var express = require('express');
var router = express.Router();
var sitemap = require('../create-sitemap/index');

/* GET home page. */
router.get('/Sitemap.xml', function(req, res) {
	sitemap.generate().then(function(data) {
		res.set('Content-Type', 'text/xml');
		res.send(data);
	});
});

router.get('*', function(req, res) {
  res.render('index', { title: 'MovieHunter' });
});


module.exports = router;
