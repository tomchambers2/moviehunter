"use strict";angular.module("cinemaApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","google-maps","ngAutocomplete","geocoder","ngFitText","youtube-embed","LocalStorageModule","angularMoment"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/video",{templateUrl:"views/video.html",controller:"VideoCtrl"}).when("/choosedate",{templateUrl:"views/choosedate.html",controller:"ChoosedateCtrl"}).when("/pickcinema",{templateUrl:"views/pickcinema.html",controller:"PickcinemaCtrl"}).when("/choosetime",{templateUrl:"views/choosetime.html",controller:"ChoosetimeCtrl"}).when("/summary",{templateUrl:"views/summary.html",controller:"SummaryCtrl"}).when("/maptest",{templateUrl:"views/maptest.html",controller:"MaptestCtrl"}).otherwise({redirectTo:"/"})}]).config(["localStorageServiceProvider",function(a){a.setPrefix("ls")}]),angular.module("cinemaApp").controller("MainCtrl",["$scope","$location","$q","$timeout","Proxy","Geocoder","tempData","localStorageService","collatedata",function(a,b,c,d,e,f,g,h,i){a.loading=0,a.searching=0;var j=function(){navigator.geolocation?navigator.geolocation.getCurrentPosition(k,l):console.log("Geolocation is not available in this browser, please type your postcode manually")},k=function(b){a.searching=1;var c=b.coords.latitude,d=b.coords.longitude;a.showSearchResults(c,d)},l=function(){console.log("Geolocation failed or permission was denied")},m=function(b,c){console.log("will set map to ",b," ",c),b=b?b:51.5,c=c?c:.1167,a.map={center:{latitude:b,longitude:c},zoom:12},a.marker={id:0,coords:{latitude:b,longitude:c},options:{draggable:!0,visible:!0,title:'"There\'s no place like home"',zIndex:1e3},events:{dragend:function(a){o(a.getPosition().lat(),a.getPosition().lng())}}}};a.cinemaMarkers=[];var n=function(){a.$broadcast("error","We couldn't find that address, sorry!"),a.searching=0},o=function(b,d){var f=c.defer(),h="http://uk-postcodes.com/latlng/"+b+","+d+".json";return e.get(h).then(function(c){if(!c.postcode)throw n(),a.loading=0,f.reject(),new Error("Postcode API returned blank");a.loading=1;var e=c.postcode;a.postcode=e,e=e.split(" ").join(""),g.saveData("postcode",e),g.saveData("latlong",{lat:b,lng:d}),f.resolve(e)}),f.promise};a.showSearchResults=function(b,d){console.log("Taking lat long, turning into postcode, then collating and plotting results"),o(b,d).then(function(g){if(m(b,d),a.loading=1,a.searching=0,h.get("cinemaList"+g)){console.log("We already have a cinema list saved, cancelling creation",h.get("cinemaList"+g));for(var j=h.get("cinemaList"+g),k=0;k<j.length;k+=1){var l={id:k,title:j[k].title,clickable:!1,latitude:j[k].coords.lat,longitude:j[k].coords.lng,icon:"/images/cinema_icons/cinema.png"};a.cinemaMarkers.push(l)}return i.getMovieList(g)||(console.log("Movie list does not exist. Will create it now with cached cinema list"),i.createMovieList(h.get("cinemaList"+g),g)),void(a.loading=2)}console.log("will load cinemas here");var n="http://moviesapi.herokuapp.com/cinemas/find/"+g;e.get(n).then(function(b){console.log("got cinema result back");for(var d=[],e=0;e<b.length;e+=1)d.push(f.latLngForAddress(b[e].address));c.all(d).then(function(c){console.log("got geocoders back");for(var d=0;d<c.length;d+=1){console.log("went round loop");var e={id:d,title:b[d].title,clickable:!1,latitude:c[d].lat,longitude:c[d].lng,icon:"/images/cinema_icons/cinema.png"};a.cinemaMarkers.push(e),j=b,j[d].coords=c[d]}h.add("cinemaList"+g,j),a.loading=2}),i.createMovieList(b,g)})},function(){console.log("We got an error with the psotcode")})},a.validateAddress=function(){a.searching=1,f.latLngForAddress(a.address).then(function(b){a.showSearchResults(b.lat,b.lng)},function(){a.loading=0})},j(),a.$watch("address",function(b){d(function(){return b&&0!==b.length?void(b===a.address&&a.validateAddress()):(a.loading=0,0)},800)})}]),angular.module("cinemaApp").service("Proxy",["$http",function(a){this.get=function(b){var c=a.get("http://localhost:8080?url="+b).then(function(a){return a.data});return c}}]),angular.module("cinemaApp").controller("VideoCtrl",["$scope","$location","$youtube","tempData","choices","Proxy","collatedata",function(a,b,c,d,e,f,g){a.movie={},a.loaded=!1,a.playerVars={autoplay:1,showinfo:0,controls:0,iv_load_policy:3};var h=function(){a.movie.synopsis="Loading synopsis",a.movie.imdb=" --",a.movie.rottenTomatoes=" --",a.movie.runtime="---"};h();var i=[];a.watchedFilms=i;var j=function(a){var b,c=Object.keys(a),d=c.length;if(i.length>=d)return i=[],null;for(;;)if(b=a[c[Math.floor(Math.random()*d)]],-1===i.indexOf(b))return i.push(b),b},k=function(){var b=j(g.getMovieList(p).list);a.movie.movieTitle=b.title,h(),e.saveChoice("movie",b.link),m(b.title),o(b.title),n(b.title)};a.showFilm=k;var l=function(){a.loaded=!0,a.$broadcast("loaded")},m=function(b){var c=/[a-zA-Z0-9'\-:& ]+/,b=b.match(c)[0],d="https://www.googleapis.com/youtube/v3/",e=encodeURIComponent("search?part=id%2Csnippet&q="+b+"%20movie%20trailer&key=AIzaSyBSLdvbrkkvY7Ft9ZYhgUqoSoBlak2A9HY"),g=d+e;f.get(g).then(function(b){a.yId=b.items[0].id.videoId,l()})},n=function(b){var c=/[a-zA-Z0-9'\-:& ]+/,b=b.match(c)[0],d="http://api.rottentomatoes.com/",e=encodeURIComponent("api/public/v1.0/movies.json?apikey=cbjztdb4a23whxw8maup8ne5&q="+b);f.get(d+e).then(function(b){if(b.movies[0]){var c={};c.runtime=b.movies[0].runtime,c.rating=b.movies[0].ratings.critics_score>=0?b.movies[0].ratings.critics_score:" --",c.rtId=b.movies[0].id,a.movie.rt=c}})},o=function(b){var c=/[a-zA-Z0-9'\-:& ]+/,d=b.match(c)[0],e="http://omdbapi.com/?t=",g=encodeURIComponent(d);f.get(e+g).then(function(b){var c={};c.rating=b.imdbRating,c.rating=b.imdbRating?"N/A"===b.imdbRating?" --":b.imdbRating:" --",c.actors=b.Actors,c.genre=b.Genre,c.imdbId=b.imdbID,c.synopsis="N/A"===b.Plot?"No summary available":b.Plot,a.movie.imdb=c})};a.$on("youtube.player.paused",function(){a.videoPaused=!0}),a.$on("youtube.player.playing",function(){a.videoPaused=!1}),a.controlVideo=function(){a.videoPaused===!0?(a.videoPaused=!1,c.player.playVideo()):(a.videoPaused=!0,c.player.pauseVideo())};var p=d.getData("postcode");p||b.path("/"),g.getMovieList(p).partiallyBuilt?k():(g.getMovieList(p).startedBuilding||b.path("/"),a.$on("firstFilmStored",function(){k()}))}]),angular.module("cinemaApp").factory("tempData",function(){var a={};return{saveData:function(b,c){a[b]=c},getData:function(b){return a[b]}}}).factory("choices",["localStorageService",function(a){var b={};return{saveChoice:function(c,d){b[c]=d,a.add(c,d)},getData:function(c){return a.get(c)?a.get(c):b[c]}}}]),angular.module("cinemaApp").service("PostcodeValidator",function(){this.check=function(a){var b="[abcdefghijklmnoprstuwyz]",c="[abcdefghklmnopqrstuvwxy]",d="[abcdefghjkpmnrstuvwxy]",e="[abehmnprvwxy]",f="[abdefghjlnpqrstuwxyz]",g="[abdefghjlnpqrst]",h="[abdefghjlnpqrstuwzyz]",i=[];i.push(new RegExp("^(bf1)(\\s*)([0-6]{1}"+g+"{1}"+h+"{1})$","i")),i.push(new RegExp("^("+b+"{1}"+c+"?[0-9]{1,2})(\\s*)([0-9]{1}"+f+"{2})$","i")),i.push(new RegExp("^("+b+"{1}[0-9]{1}"+d+"{1})(\\s*)([0-9]{1}"+f+"{2})$","i")),i.push(new RegExp("^("+b+"{1}"+c+"{1}?[0-9]{1}"+e+"{1})(\\s*)([0-9]{1}"+f+"{2})$","i")),i.push(/^(GIR)(\s*)(0AA)$/i),i.push(/^(bfpo)(\s*)([0-9]{1,4})$/i),i.push(/^(bfpo)(\s*)(c\/o\s*[0-9]{1,3})$/i),i.push(/^([A-Z]{4})(\s*)(1ZZ)$/i),i.push(/^(ai-2640)$/i);for(var j=!1,k=0;k<i.length;k++)if(i[k].test(a)){i[k].exec(a),a=RegExp.$1.toUpperCase()+" "+RegExp.$3.toUpperCase(),a=a.replace(/C\/O\s*/,"c/o "),"AI-2640"===a.toUpperCase()&&(a="AI-2640"),j=!0;break}return j?a:!1}}),angular.module("cinemaApp").directive("youtubePlayer",["$sce",function(a){return{templateUrl:"/views/youtubeplayer.html",replace:!0,restrict:"E",link:function(b){b.$watch("yId",function(c){c&&(b.url=a.trustAsResourceUrl("http://www.youtube.com/embed/"+c+"?autoplay=1&showinfo=0&controls=0&iv_load_policy=3&enablejsapi=1"))},!0),b.$on("play",function(){console.log("will play"),document.getElementById("ytplayer").playVideo()}),b.$on("pause",function(){console.log("will pause"),document.getElementById("ytplayer").pauseVideo()})}}}]),angular.module("cinemaApp").controller("PickcinemaCtrl",["$scope","$location","$q","localStorageService","tempData","choices","collatedata","Geocoder","Directions",function(a,b,c,d,e,f,g,h,i){var j=e.getData("postcode"),k=e.getData("latlong"),l=f.getData("movie");l||b.path("/");var m=f.getData("date");a.dateChoice=m,a.drawPolyline=function(b){a.polylines=[{id:1,path:google.maps.geometry.encoding.decodePath(q[b].polyline),stroke:{color:"#9E0326"}}]},a.nextStep=function(a){f.saveChoice("cinema",a),b.path("/choosetime")},h.latLngForAddress(j).then(function(a){console.log(a)},function(a){console.log(a)});var n=d.get("cinemaList"+j),o=g.getMovieList(j).list,p=o[l];a.movieTitle=p.title;for(var q=[],r=0;r<n.length;r+=1)for(var s in p.cinemas)n[r].venue_id===s&&(n[r].times=p.cinemas[s].times,q.push(n[r]));a.cinemaMarkers=[];for(var t=[],u=0;u<q.length;u+=1){var v=q[u].coords;t.push(i.doRequest({lat:v.lat,lng:v.lng},{lat:k.lat,lng:k.lng}));var w={id:u,title:q[u].title,clickable:!1,latitude:q[u].coords.lat,longitude:q[u].coords.lng,icon:"/images/cinema_icons/cinema.png"};a.cinemaMarkers.push(w)}c.all(t).then(function(a){for(var b=0;b<q.length;b+=1)q[b].polyline=a[b].routes[0].overview_polyline},function(a){throw new Error(a)}),a.collatedCinemas=q,a.map={center:{latitude:k.lat,longitude:k.lng},zoom:12};var x={id:300,latitude:k.lat,longitude:k.lng};a.cinemaMarkers.push(x)}]),angular.module("cinemaApp").controller("ChoosedateCtrl",["$scope","$location","tempData","collatedata","choices",function(a,b,c,d,e){var f=c.getData("postcode");f||b.path("/");var g=e.getData("movie");g||b.path("/");var h=d.getMovieList(f).list,i=h[g];a.movieTitle=i.title,a.cinemas=i.cinemas;var j=function(a){var b=[];a=a||7;for(var c=(new Date).getTime(),d=0;a+1>d;d+=1){var e=c+864e5*d;b.push(e)}return b};a.availableDays=j(5),a.pickDate=function(a){e.saveChoice("date",a),b.path("/pickcinema")}}]),angular.module("cinemaApp").controller("ChoosetimeCtrl",["$scope","$location","tempData","collatedata","choices","localStorageService",function(a,b,c,d,e,f){var g=c.getData("postcode"),h=e.getData("movie"),i=e.getData("date");a.dateChoice=i;var j=e.getData("cinema"),k=f.get("cinemaList"+g),l=[],m=d.getMovieList(g).list,n=m[h];a.movieTitle=n.title,g||b.path("/"),h||b.path("/");for(var o=0;o<k.length;o+=1)for(var p in n.cinemas)k[o].venue_id===p&&(k[o].times=n.cinemas[p].times,l.push(k[o]));a.cinema=l[j],a.nextStep=function(a){e.saveChoice("time",a),b.path("/summary")}}]),angular.module("cinemaApp").controller("SummaryCtrl",["$scope","tempData","choices","collatedata","localStorageService",function(a,b,c,d,e){var f=b.getData("postcode"),g=c.getData("movie"),h=c.getData("date");a.dateChoice=h,a.timeChoice=c.getData("time");var i=c.getData("cinema"),j=e.get("cinemaList"+f),k=[],l=d.getMovieList(f).list,m=l[g];a.movieTitle=m.title;for(var n=0;n<j.length;n+=1)for(var o in m.cinemas)j[n].venue_id===o&&(j[n].times=m.cinemas[o].times,k.push(j[n]));a.cinema=k[i]}]),angular.module("ngAutocomplete",[]).directive("ngAutocomplete",function(){return{require:"ngModel",scope:{ngModel:"=",options:"=?",details:"=?"},link:function(a,b,c,d){var e,f=!1,g=function(){e={},a.options&&(f=a.options.watchEnter!==!0?!1:!0,a.options.types?(e.types=[],e.types.push(a.options.types),a.gPlace.setTypes(e.types)):a.gPlace.setTypes([]),a.options.bounds?(e.bounds=a.options.bounds,a.gPlace.setBounds(e.bounds)):a.gPlace.setBounds(null),a.options.country?(e.componentRestrictions={country:a.options.country},a.gPlace.setComponentRestrictions(e.componentRestrictions)):a.gPlace.setComponentRestrictions(null))};void 0==a.gPlace&&(a.gPlace=new google.maps.places.Autocomplete(b[0],{})),google.maps.event.addListener(a.gPlace,"place_changed",function(){var c=a.gPlace.getPlace();void 0!==c&&(void 0!==c.address_components?a.$apply(function(){a.details=c,d.$setViewValue(b.val())}):f&&h(c))});var h=function(c){var e=new google.maps.places.AutocompleteService;c.name.length>0&&e.getPlacePredictions({input:c.name,offset:c.name.length},function(c){if(null==c||0==c.length)a.$apply(function(){a.details=null});else{var e=new google.maps.places.PlacesService(b[0]);e.getDetails({reference:c[0].reference},function(c,e){e==google.maps.GeocoderStatus.OK&&a.$apply(function(){d.$setViewValue(c.formatted_address),b.val(c.formatted_address),a.details=c;b.on("focusout",function(){b.val(c.formatted_address),b.unbind("focusout")})})})}})};d.$render=function(){var a=d.$viewValue;b.val(a)},a.watchOptions=function(){return a.options},a.$watch(a.watchOptions,function(){g()},!0)}}}),angular.module("geocoder",["ngStorage"]).factory("Geocoder",["$localStorage","$q","$timeout",function(a,b,c){var d=a.locations?JSON.parse(a.locations):{},e=[],f=250,g=function(){var b=e[0],h=new google.maps.Geocoder;h.geocode({address:b.address},function(h,i){if(i===google.maps.GeocoderStatus.OK){var j={lat:h[0].geometry.location.lat(),lng:h[0].geometry.location.lng()};e.shift(),d[b.address]=j,a.locations=JSON.stringify(d),b.d.resolve(j),e.length&&c(g,f)}else i===google.maps.GeocoderStatus.ZERO_RESULTS?(e.shift(),b.d.reject({type:"zero",message:"Zero results for geocoding address "+b.address})):i===google.maps.GeocoderStatus.OVER_QUERY_LIMIT?(f+=250,c(g,f)):i===google.maps.GeocoderStatus.REQUEST_DENIED?(e.shift(),b.d.reject({type:"denied",message:"Request denied for geocoding address "+b.address})):i===google.maps.GeocoderStatus.INVALID_REQUEST&&(e.shift(),b.d.reject({type:"invalid",message:"Invalid request for geocoding address "+b.address}))})};return{latLngForAddress:function(a){var f=b.defer();return _.has(d,a)?c(function(){f.resolve(d[a])}):(e.push({address:a,d:f}),1===e.length&&g()),f.promise}}}]),angular.module("cinemaApp").factory("collatedata",["$rootScope","Proxy","$q","localStorageService",function(a,b,c,d){var e={};e.list={},e.partiallyBuilt=!1;var f=/[a-zA-Z0-9'\-:& ]+/,g=function(g,h){e.startedBuilding=!0,console.log("Loading movie data in the background");for(var i=[],j=0;j<g.length;j+=1){var k="http://moviesapi.herokuapp.com/cinemas/"+g[j].venue_id+"/showings",l=b.get(k);i.push(l)}c.all(i).then(function(b){for(var c=0;c<b.length;c+=1)for(var d=g[c],h=b[c],i=0;i<h.length;i+=1){var j=h[i];if(e.list[j.link]){e.list[j.link].cinemas[d.venue_id]={};var k=[d.title,d.distance,d.address,d.link];e.list[j.link].cinemas[d.venue_id].info=k,e.list[j.link].cinemas[d.venue_id].times=j.time}else{e.list[j.link]={},e.list[j.link].cinemas={},e.list[j.link].cinemas[d.venue_id]={};var k=[d.title,d.distance,d.address,d.link];e.list[j.link].cinemas[d.venue_id].info=k,e.list[j.link].cinemas[d.venue_id].times=j.time,e.list[j.link].title=j.title.match(f)[0],e.list[j.link].link=j.link}0===c&&0===i&&(a.$broadcast("firstFilmStored"),e.partiallyBuilt=!0)}}).then(function(){e.collated=!0,d.add("movies"+h,e)})};return{createMovieList:g,getMovieList:function(a){return d.get("movies"+a)?(console.log("Getting cached data instead. update this to check for staleness"),d.get("movies"+a)):e}}}]),angular.module("cinemaApp").directive("fadingControls",["$timeout",function(a){return{restrict:"A",link:function(b,c){var d=[];b.$on("loaded",function(){for(var b=0;b<d.length;b+=1)a.cancel(d[b]),d.shift();a(function(){c.addClass("hidden")},3e3)}),c.bind("mouseover",function(){for(var b=0;b<d.length;b+=1)a.cancel(d[b]),d.shift();c.removeClass("hidden");var e=a(function(){c.addClass("hidden")},4500);d.push(e)})}}}]),angular.module("cinemaApp").filter("trimWords",function(){return function(a,b){for(var b=b||1,c=a.split(" "),d=[],e=0;b>e;e+=1)d.push(c[e]);return d.join(" ")}}),angular.module("cinemaApp").filter("splitOnCommas",function(){return function(a,b){for(var b=b||0,c=a.split(", "),d=[],e=0;b+1>e;e+=1)d.push(c[e]);return d.join(", ")}}),angular.module("cinemaApp").factory("Directions",["$q",function(a){var b=new google.maps.DirectionsService,c=function(c,d){var e=a.defer(),f=new google.maps.LatLng(c.lat,c.lng),g=new google.maps.LatLng(d.lat,d.lng),h={origin:f,destination:g,travelMode:google.maps.TravelMode.DRIVING};return b.route(h,function(a){console.log(a),e.resolve(a)}),e.promise};return{doRequest:c}}]),angular.module("cinemaApp").directive("errorMessage",["$timeout",function(a){return{template:'<div class="alert-box alert hidden text-center"></div>',restrict:"E",replace:!0,link:function(b,c){b.$on("error",function(b){c.removeClass("hidden"),console.log(b),c.text("Sorry, we couldn't find that address"),a(function(){c.addClass("hidden")},2e3)})}}}]);