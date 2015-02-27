var XmlWriter = require('simple-xml-writer').XmlWriter;
var moment = require('moment');
var Firebase = require('firebase');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var locations = require('./locations');

var ref = new Firebase('https://movielistings.firebaseio.com');

var cinemas;
var movies;
var urls = [];

var cinemasComplete = false;
var cinemas = ref.child('cinemas').on('value', function(result) {
 	cinemas = _.values(result.val());
 	if (moviesComplete) {
 		buildXML();
 	} else {
 		cinemasComplete = true;
 	}	
});
var moviesComplete = false;
var movies = ref.child('movies').on('value', function(result) {
 	movies = _.values(result.val());
 	if (cinemasComplete) {
 		buildXML();
 	} else {
 		moviesComplete = true;
 	}
});

var addUrl = function(url) {
	urls.push(url);
}

var today = moment().format('YYYY-MM-DD');

var buildXML = function() {	
	var data = new XmlWriter(function(el) {
	    el('urlset', function(el, at) {
	        at('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
	        //create url for each location
	    	for (var i = 0; i < locations.length; i++) {
		        el('url', function(el, at) {
		            el('loc', 'http://moviehunter.co.uk/'+locations[i]);
		            el('lastmod', today);
		            el('changefreq','daily');
		        });
		       	addUrl('http://moviehunter.co.uk/'+locations[i]);
		        //create url for location + movie
		        for (var j = 0; j < movies.length; j++) {
		        	if (!movies[i]) continue;
		        	var hyphenatedMovieTitle = movies[j].title.replace(/\s+/g, '-').toLowerCase();
			        el('url', function(el, at) {
			            el('loc', 'http://moviehunter.co.uk/'+locations[i]+'/'+hyphenatedMovieTitle);
			            el('lastmod', today);
			            el('changefreq','daily');
			        });	        
			        addUrl('http://moviehunter.co.uk/'+locations[i]+'/'+hyphenatedMovieTitle);	
		        };
	       	};

	       	//a url for every cinema
	       	for (var i = 0; i < cinemas.length; i++) {
	       		var hyphenatedCinemaTitle = cinemas[i].title.replace(/\s+/g, '-').toLowerCase();
		        el('url', function(el, at) {
		            el('loc', 'http://moviehunter.co.uk/cinema/'+hyphenatedCinemaTitle);
		            el('lastmod', today);
		            el('changefreq','daily');
		        });
		        addUrl('http://moviehunter.co.uk/cinema/'+hyphenatedCinemaTitle);
		        //a url for every cinema + movie
		        //TODO: skip for now as it will create too many entries, perhaps do for each cinema. not high priority.
		        // for (var j = 0; j < movies.length; j++) {
			       //  el('url', function(el, at) {
			       //      el('loc', 'http://moviehunter.co.uk/'+hyphenatedTitle+'/'+hyphenatedMovieTitle);
			       //      el('lastmod','today');
			       //      el('changefreq','daily');
			       //  });	        	
		        // };	        
	       	};
	    });
	}, { addDeclaration: true });

	console.log('Will write to',path.join(__dirname, '../public/Sitemap.xml'));

	fs.writeFile(path.join(__dirname, '../public/Sitemap.xml'), data.toString(), function(err) {
		if (err) throw err;
		console.log("Wrote sitemap to XML");
	});
	fs.writeFile('urls.json', urls, function(err) {
		if (err) throw err;
		console.log("Wrote urls to XML");
	});	
}
