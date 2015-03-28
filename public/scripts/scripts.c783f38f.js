"use strict";window.prerenderReady=!1,angular.module("cinemaApp",["ngRoute","geocoder","youtube-embed","angulartics","angulartics.segment.io","angular-lodash"]).constant("angularMomentConfig",{timezone:"Europe/London"}).config(["$routeProvider","$locationProvider",function(a,b){b.html5Mode({enabled:!0,requireBase:!1}),a.when("/",{templateUrl:"/views/main.html",controller:"MainCtrl"}).when("/cinema/:cinema/:movie",{templateUrl:"/views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/cinema/:cinema",{templateUrl:"/views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/movie/:movie",{templateUrl:"/views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/:location/:movie",{templateUrl:"/views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).when("/:location",{templateUrl:"/views/main.html",controller:"MainCtrl",reloadOnSearch:!1}).otherwise({redirectTo:"/"})}]).config(["$provide",function(a){a.decorator("$q",["$delegate",function(a){var b=a;return b.allComplete=function(a){if(!angular.isArray(a))throw Error("$q.allComplete only accepts an array.");var c=b.defer(),d=0,e=0,f=[];return angular.forEach(a,function(b){b.then(function(a){console.info("done",a),d++,f.push(a)}).catch(function(a){console.error("err",a),e++,f.push(a)}).finally(function(){d+e===a.length&&c.resolve(f)})}),c.promise},b}])}]).run(["$route","$rootScope","$location",function(a,b,c){var d=c.path;c.path=function(e,f){if(f===!1)var g=a.current,h=b.$on("$locationChangeSuccess",function(){a.current=g,h()});return d.apply(c,[e])}}]),angular.module("geocoder",["ngStorage"]).factory("Geocoder",["$localStorage","$q","$timeout","$rootScope",function(a,b,c,d){var e=a.locations?JSON.parse(a.locations):{},f=[],g=250,h=function(){console.log("executing next");var b=f[0],i=new google.maps.Geocoder;i.geocode({address:b.address,componentRestrictions:{country:"GB"}},function(i,j){if(console.log("RESULT",i),"United Kingdom"===i[0].formatted_address)f.shift(),b.d.reject({type:"zero",message:"Zero results for geocoding address "+b.address});else if(j===google.maps.GeocoderStatus.OK){var k={lat:i[0].geometry.location.lat(),lng:i[0].geometry.location.lng(),formattedAddress:i[0].formatted_address};e[b.address]=k,a.locations=JSON.stringify(e),f.shift(),b.d.resolve(k)}else j===google.maps.GeocoderStatus.ZERO_RESULTS?(f.shift(),b.d.reject({type:"zero",message:"Zero results for geocoding address "+b.address})):j===google.maps.GeocoderStatus.OVER_QUERY_LIMIT?b.executedAfterPause&&(f.shift(),b.d.reject({type:"busy",message:"Geocoding server is busy can not process address "+b.address})):j===google.maps.GeocoderStatus.REQUEST_DENIED?(f.shift(),b.d.reject({type:"denied",message:"Request denied for geocoding address "+b.address})):(f.shift(),b.d.reject({type:"invalid",message:"Invalid request for geocoding: status="+j+", address="+b.address}));if(f.length)if(j===google.maps.GeocoderStatus.OVER_QUERY_LIMIT){var l=f[0];l.executedAfterPause=!0,c(h,g)}else c(h,0);d.$$phase||d.$apply()})};return{latLngForAddress:function(a){var c=b.defer();return _.has(e,a)?c.resolve(e[a]):(f.push({address:a,d:c}),1===f.length&&h()),c.promise}}}]),angular.module("cinemaApp").directive("errorMessage",["$timeout",function(a){return{template:'<div class="alert-box alert hidden text-center"></div>',restrict:"E",replace:!0,link:function(b,c){b.$on("error",function(){c.removeClass("hidden"),c.text("Sorry, we couldn't find that address"),a(function(){c.addClass("hidden")},2e3)})}}}]),angular.module("cinemaApp").controller("MainCtrl",["$scope","$location","$routeParams","$q","$timeout","Geocoder","geolocation",function(a,b,c,d,e,f,g){function h(){var b=new google.maps.LatLng(51.5,-.1167),c={zoom:14,minZoom:14,center:b},d=new google.maps.Map(document.getElementById("map-canvas"),c);a.map=d;var e={maxZoom:16,imageExtension:"png",imagePath:"/images/cinema_icons/cinema-stack"},f=new MarkerClusterer(d,[],e);a.mc=f,google.maps.event.addListener(d,"bounds_changed",function(){var a=this.getBounds(),b=a.getCenter(),c=a.getNorthEast(),d=3963,e=b.lat()/57.2958,f=b.lng()/57.2958,g=c.lat()/57.2958,h=c.lng()/57.2958,i=d*Math.acos(Math.sin(e)*Math.sin(g)+Math.cos(e)*Math.cos(g)*Math.cos(h-f)),j=1.609344*i;p.updateCriteria({radius:j})}),google.maps.event.addListener(d,"dragend",function(){mixpanel.track("Moved map",{coords:this.center}),u(),a.updateGeoQuery(this.center.k,this.center.D),v({coords:{lat:this.center.k,lng:this.center.D}})}),google.maps.event.addListener(d,"zoom_changed",function(){a.updateGeoQuery(this.center.k,this.center.D),v({coords:{lat:this.center.k,lng:this.center.D}})})}function i(b){a.youAreHereMarker&&a.youAreHereMarker.setMap(null),a.youAreHereMarker=new google.maps.Marker({position:{lat:b.lat,lng:b.lng},map:a.map,title:b.formattedAddress,id:"youAreHere"})}function j(a){return A.leftLat<=a.latitude&&a.latitude<=A.rightLat&&A.leftLng<=a.longitude&&a.longitude<=A.rightLng?!0:void 0}var k=new Firebase("https://movielistings.firebaseio.com/"),l=k.child("cinemas"),m=k.child("movies"),n=new GeoFire(k.child("cinemasGeofire"));a.loading=!0,a.voted=!1,a.vote=function(b){mixpanel.track("Vote",{Choice:b}),a.voted=!0},a.closeModal=function(){a.geolocationFailed=!1};var o=2.813,p=n.query({center:[51.5,-.1167],radius:o});a.filters={moviename:""},a.movieNames=[],a.cinemasLoading=!0,a.selectedMovie=null,a.selectedCinema=null,a.selectedDay=moment().startOf("day").valueOf(),a.selectedDays={0:moment().startOf("day").valueOf(),1:moment().startOf("day").add(1,"days").valueOf(),2:moment().startOf("day").add(2,"days").valueOf(),3:moment().startOf("day").add(3,"days").valueOf()},a.selectedDayIndex=0,a.tomorrowPlus1=moment().startOf("day").add(2,"days").format("dddd"),a.tomorrowPlus2=moment().startOf("day").add(3,"days").format("dddd"),a.movieIds=[],a.movies=[],a.cinemas=[],a.cinemaMovies={},a.searchMoviesFast=function(){return _.some(a.movies,a.filters.moviename)},a.setMovienameFilter=function(){a.unselectCinema(),a.filters.moviename=a.searchMoviename},a.resetMovienameFilter=function(){a.searchMoviename="",a.filters.moviename=""},a.resetFilters=function(){a.searchMoviename="",a.selectedCinema=null,a.selectedMovie=null,a.filters.moviename=""},a.$on("selectedCinema",function(b,c){a.selectCinema({tid:c,dontReset:!0})}),a.filterByMovieIds=function(b){return a.movieIds.indexOf(b.id)>-1?!0:void 0},a.filterBySelectedCinema=function(b){return a.selectedCinema?b[a.selectedCinema]?!0:void 0:!0},a.selectDay=function(b){mixpanel.track("selectday",{adjust:b}),a.selectedDay=moment().add(b,"days").startOf("day").valueOf(),a.selectedDayIndex=parseInt(b,10)},p.on("key_entered",function(b){l.child(b).on("value",function(b){a.cinemasLoading=!1;var c=b.val();if(null!==c&&!_.findWhere(a.cinemas,{tid:c.tid})){if(a.cinemas.push(c),c.movies)for(var d=0;d<c.movies.length;d++)a.movieIds.push(c.movies[d]);a.$apply()}})}),p.on("key_exited",function(b){l.child(b).on("value",function(b){var c=b.val(),d=_.findWhere(a.cinemas,{tid:c.tid});if(a.cinemas.splice(a.cinemas.indexOf(d),1),null!==c&&c.movies)for(var e=0;e<c.movies.length;e++)c.movies[e]!==a.selectedMovie&&a.movieIds.splice(a.movieIds.indexOf(c.movies[e]),1)})}),m.on("child_added",function(b){var c=b.val();c.id=b.key(),a.movies.push(c),a.movieNames.push(c.title),a.$apply()});var q=function(a){return a.rt?"number"!=typeof a.rt.rating?-1:a.rt.rating:-1},r=function(a){if(!a.imdb)return-1;var b=parseFloat(a.imdb.rating);return"number"!=typeof b?-1:b},s=function(a){return a.rt.releaseDate?a.rt.releaseDateTimestamp:-1},t=function(a){return a.rt.releaseDate?-a.rt.releaseDateTimestamp:-1};a.filterFns=[{l:"Rotten Tomatoes rating",fn:q},{l:"IMDB rating",fn:r},{l:"Newest movies first",fn:s},{l:"Oldest movies first",fn:t}],a.filterFn=q,a.selectCinema=function(b){b.dontReset||a.resetFilters();var c;b.cinema||(c=_.findWhere(a.cinemas,{tid:b.tid}),v({cinema:c})),mixpanel.track("Select cinema",{Cinema:c.title}),e(function(){a.selectedCinema=b.tid,a.selectedCinemaObject=b.cinema||c})},a.unselectCinema=function(){mixpanel.track("Unselect cinema"),u()};var u=function(){mixpanel.track("Unselect cinema"),e(function(){v(),a.selectedCinema=null})};a.filterCinemas=function(b){var c=_.findWhere(a.movies,{id:b.movie});mixpanel.track("Select movie",c.title),b.reset&&a.resetFilters(),b.updateUrl&&v({movie:c}),e(function(){a.filters.moviename=a.searchMoviename=c.title,b.cinema&&a.selectCinema({cinema:b.cinema,dontReset:!0})})},a.unfilterCinemas=function(){var c=b.path(),d=c.match(/^(\/[a-z0-9.+-]+)/);e(function(){b.path(d[1],!1)}),a.selectedMovie=null,a.filters.moviename="",a.selectedMovieObject=null},a.showSearchResults=function(b,c){a.updateGeoQuery(b,c),w(b,c),a.loading=!1},a.updateGeoQuery=function(a,b){p.updateCriteria({center:[parseFloat(a),parseFloat(b)]})};var v=function(c){return c&&c.movie&&c.cinema?void 0:c&&c.movie?void e(function(){var d=a.map.center.k+"+"+a.map.center.D;b.path(d+"/"+c.movie.url,!1)}):c&&c.cinema?void e(function(){b.path("/cinema/"+c.cinema.url,!1)}):void e(function(){var c=a.map.center.k+"+"+a.map.center.D;if(a.selectedMovie){var d=_.findWhere(a.movies,{id:a.selectedMovie});b.path("/"+c+"/"+d.url,!1)}else b.path("/"+c,!1)})};a.doSearch=function(b){a.geolocationFailed=!1,a.addressError=!1,b=b?b:a.address,a.address=b,mixpanel.track("search",{location:a.address}),a.loading=!0,f.latLngForAddress(b).then(function(b){i(b),a.updateGeoQuery(b.lat,b.lng),w(b.lat,b.lng),a.loading=!1},function(b){throw a.addressError=!0,a.loading=!1,new Error("Problem geocoding users address",b)})},h();var w=function(c,d){c=c?c:51.5,d=d?d:-.1167,a.map.setCenter(new google.maps.LatLng(c,d)),b.path||v({coords:{lat:c,lng:d}})};w(),a.playerVars={autoplay:1,showinfo:0,controls:1,iv_load_policy:3,rel:0,modestbranding:1},a.youtubePlayer={player:null},a.openTrailer=function(b){a.youtubeId=b.youtube},a.closeTrailer=function(){a.youtubeId=null},navigator.geolocation&&(a.geolocationFeature=!0),a.getLocation=function(){navigator.geolocation?(navigator.geolocation.getCurrentPosition(y,z),a.loading=!0,a.address="Finding you..."):console.warn("Geolocation is not available in this browser, please type your postcode manually")};var x,y=function(b){a.showSearchResults(b.coords.latitude,b.coords.longitude)},z=function(){console.warn("Geolocation failed or permission was denied")},A={leftLng:-14.69970703125,leftLat:49.93707975697545,rightLng:7.31689453125,rightLat:59.097025270871335},B=function(){g.get().then(function(b){return console.log("COORDS",b),j(b)?void a.showSearchResults(b.latitude,b.longitude):(mixpanel.track("getip",{coords:a.address,uk:!1}),console.log("NOT IN UK"),e(function(){a.geolocationFailed=!0}),void mixpanel.track("getip",{coords:a.address,uk:!0}))})};c.location&&c.movie?(console.info("LOCATION AND MOVIE"),m.orderByChild("url").equalTo(c.movie).on("child_added",function(b){var c=b.val();c.id=b.key(),a.filterCinemas({movie:c.id,updateUrl:!1}),e(function(){a.filters.moviename=c.title})}),x=c.location.match(/([0-9]{2}[0-9.]+)\+([-0-9.]+)/),x?a.showSearchResults(x[1],x[2]):a.doSearch(c.location)):c.cinema&&c.movie?(console.info("CINEMA AND MOVIE",c.cinema,c.movie),m.orderByChild("url").equalTo(c.movie).on("child_added",function(b){var c=b.val();c.id=b.key(),a.filterCinemas({movie:c.id,updateUrl:!1}),e(function(){a.filters.moviename=c.title})}),l.orderByChild("url").equalTo(c.cinema).on("child_added",function(b){var c=b.val();a.cinemas.push(c),a.showSearchResults(c.coords[0],c.coords[1]),a.selectCinema({tid:c.tid,cinema:c,dontReset:!0})})):c.location?(x=c.location.match(/([0-9]{2}[0-9.]+)\+([-0-9.]+)/),x?a.showSearchResults(x[1],x[2]):a.doSearch(c.location)):c.movie?(console.info("MOVIE ONLY"),B(),m.orderByChild("url").equalTo(c.movie).on("child_added",function(b){console.info("got movie",b.val());var c=b.val();c.id=b.key(),a.filterCinemas({movie:c.id,updateUrl:!0}),e(function(){a.filters.moviename=c.title})})):c.cinema?l.orderByChild("url").equalTo(c.cinema).on("child_added",function(b){var c=b.val();a.cinemas.push(c),a.selectCinema({tid:c.tid,cinema:c}),a.showSearchResults(c.coords[0],c.coords[1])}):B()}]),angular.module("cinemaApp").factory("geolocation",["$q","$http",function(a,b){function c(){var c=a.defer();return b.get("http://www.telize.com/geoip").then(function(a){var b={latitude:a.data.latitude,longitude:a.data.longitude};c.resolve(b)}),c.promise}return{get:c}}]),angular.module("cinemaApp").directive("expand",function(){return{restrict:"A",link:function(a,b,c){a.$watch("open",function(a){b.css("height",a?"auto":c.fixedheight)}),b.css("height",c.fixedheight)}}}),angular.module("cinemaApp").directive("fullWidth",function(){return{restrict:"A",link:function(a,b,c){var d=b.parent()[0].offsetWidth-c.margin;b.css({width:d+"px"})}}}),angular.module("cinemaApp").directive("markers",["$compile","$rootScope",function(a,b){return{restrict:"E",link:function(c,d,e){function f(a){var b=_.findWhere(c.movies,{id:c.selectedMovie}),d=c.selectedDay,e=[];e.push("<strong>Showtimes for "+moment(d).format("dddd")+"</strong>"),e.push(b[a.tid][d]?b[a.tid][d].times.join(", "):"<strong>Not showing here on "+moment(d).format("dddd")+"</strong>"),c.markers[a.tid].movieInfo="<strong>"+a.title+'</strong><br><i>Click for all movies at this cinema</i><ul class="movie-list"><li>'+e.join("</li><li>")+"</li></ul>"}function g(b){var d=new google.maps.Marker({position:{lat:b.coords[0],lng:b.coords[1]},map:c.map,title:b.title,id:b.tid,icon:m}),f=c.movies;if(b.movieDetails=[],b.movieTimes=[],b.movies){var g;if(e.selectedMovie){g=_.findWhere(f,{id:e.selectedMovie});var h=c.selectedDay;b.movieTimes.push("Showtimes for "+moment(h).format("dddd")),b.movieTimes.push(g[b.tid][h]?g[b.tid][h].times.join(", "):"<strong>Not showing here on "+moment(h).format("dddd")+"</strong>")}for(var i=0;i<b.movies.length;i++)g=_.findWhere(f,{id:b.movies[i]}),g&&b.movieDetails.push("<a ng-click=\"filterCinemas({ movie: '"+b.movies[i]+"', cinema: '"+b.tid+"', updateUrl: true })\">"+g.title+"</a>")}d.movieInfo="<div><strong>"+b.title+"</strong><br><i><a ng-click=\"selectCinema({ tid: '"+b.tid+'\', dontReset: true })">Filter by this cinema</a></i><ul class="movie-list"><li>'+b.movieTimes.join("</li><li>")+"</li></ul></div>",d.cinemaInfo="<div><strong>"+b.title+"</strong><br><i><a ng-click=\"selectCinema({ tid: '"+b.tid+'\', dontReset: true })">Filter by this cinema</a></i><ul class="movie-list"><li>'+b.movieDetails.join("</li><li>")+"</li></ul></div>";var j=new google.maps.InfoWindow({maxWidth:230,disableAutoPan:!0});google.maps.event.addListener(d,"click",function(){if(c.selectedMovie){var b=a(d.movieInfo)(c);j.setContent(b[0])}else{var b=a(d.cinemaInfo)(c);j.setContent(b[0])}j.open(c.map,d)}),c.mc.addMarker(d),c.markers[b.tid]=d}function h(a){c.mc.removeMarker(c.markers[a]),c.markers[a].setMap(null),delete c.markers[a]}function i(a){c.markers[a].setAnimation(google.maps.Animation.BOUNCE)}function j(a){c.markers[a].setAnimation(null)}function k(a,b){return c.markers[a]?void("default"===b?c.markers[a].setIcon(m):"disabled"===b&&c.markers[a].setIcon(n)):void console.error(a,"does not exist")}function l(a){if(a=a||c.filters.moviename,""!==a)for(var b=_.filter(c.movies,function(b){var c=b.title.toLowerCase();return c.indexOf(a.toLowerCase())>-1?!0:void 0}),d=0;d<c.cinemas.length;d++)for(var e=0;e<b.length;e++)c.cinemas[d].movies.indexOf(b[e].id)>-1?k(c.cinemas[d].tid,"default"):k(c.cinemas[d].tid,"disabled");else for(var d=0;d<c.cinemas.length;d++)k(c.cinemas[d].tid,"default")}c.markers={},c.prevTids=[];var m="/images/cinema_icons/cinema.png",n="/images/cinema_icons/cinema_disabled.png";b.$on("bounce",function(a,b){i(b)}),b.$on("stopBounce",function(a,b){j(b)}),c.$watch("filters.moviename",function(){l()}),c.$watch("selectedMovie",function(a,b){var d,e;if(b!==a)if(a){if(a){for(d=0;d<c.cinemaList.length;d++)e=c.cinemaList[d],null!==e&&(_.contains(e.movies,a)?c.markers[e.tid]?f(e):g(e):c.markers[e.tid]&&h(e.tid));l()}}else for(d=0;d<c.cinemaList.length;d++)e=c.cinemaList[d],null!==e&&(c.markers[e.tid]||g(e))}),c.$watch("cinemas",function(a){c.cinemaList=a,a=_.filter(a,function(a){return null!==a?!0:void 0});for(var b=_.difference(_.pluck(a,"tid"),c.prevTids),d=0;d<b.length;d++){var f=_.findWhere(a,{tid:b[d]});(!e.selectedMovie||_.contains(f.movies,e.selectedMovie))&&null!==f&&g(f)}for(var i=_.difference(c.prevTids,_.pluck(a,"tid")),j=0;j<i.length;j++)c.markers[i[j]]&&h(i[j]);c.prevTids=_.pluck(a,"tid"),l()},!0)}}}]),angular.module("cinemaApp").directive("movieTimes",["$compile",function(a){return{restrict:"E",link:function(b,c){function d(a,c,d){b.movie[c.tid][b.selectedDays[a]]&&d.push('<a ng-click="selectDay('+a+');$event.stopPropagation()">'+moment(b.selectedDays[a]).format("dddd")+"</a>")}function e(){if(!b.selectedCinema){for(var e,f=[],g=0;g<b.cinemaList.length;g++)if(e=b.cinemaList[g],b.movie[e.tid])if(b.movie[e.tid][b.selectedDay])f.push('<div class="times-box" ng-mouseover="bounce(\''+e.tid+"')\" ng-mouseleave=\"stopBounce('"+e.tid+"')\"><p>"+e.title+"</p><p>"+b.movie[e.tid][b.selectedDay].times.join(" | ")+"</p></div>");else{for(var h=[],i=0;4>i;i++)b.selectedDays[i]!==b.selectedDay&&d(i,e,h);f.push(h.length?'<div class="times-box" ng-mouseover="bounce(\''+e.tid+"')\" ng-mouseleave=\"stopBounce('"+e.tid+"')\"><p>"+e.title+"</p><p>Showing "+h.join(", ")+"</i></p></div>":'<div class="times-box"  ng-mouseover="bounce(\''+e.tid+"')\" ng-mouseleave=\"stopBounce('"+e.tid+"')\"><p>"+e.title+"</p><p><i>Not showing here</i></p>")}return f.unshift('<p class="text-center"><strong>'+moment(b.selectedDay).format("dddd")+" showtimes</strong></p>"),c.html(f),void a(c.contents())(b)}if(!b.movie[b.selectedCinema][b.selectedDay])return c.html('<div class="times-box" ng-mouseover="bounce(\''+b.selectedCinemaObject.tid+"')\" ng-mouseleave=\"stopBounce('"+b.selectedCinemaObject.tid+"')\"><p>Not showing here</p></div>"),c.html(f),void a(c.contents())(b);var e=_.findWhere(b.cinemas,{tid:b.selectedCinema}),f='<p class="text-center"><strong>'+moment(b.selectedDay).format("dddd")+' showtimes</strong></p> <div class="times-box" ng-mouseover="bounce(\''+e.tid+"')\" ng-mouseleave=\"stopBounce('"+e.tid+"')\"><p>"+e.title+"</p><p>"+b.movie[b.selectedCinema][b.selectedDay].times.join(" | ")+"</p></div>";c.html(f),a(c.contents())(b)}b.$watch("selectedCinema",function(){e()}),b.$watch("selectedDay",function(){e()}),b.$watch("cinemas",function(a){b.cinemaList=a,e()},!0),b.bounce=function(a){b.$emit("bounce",a)},b.stopBounce=function(a){b.$emit("stopBounce",a)},e()}}}]),angular.module("cinemaApp").directive("timeAgo",function(){return{restrict:"A",scope:{timeAgo:"="},link:function(a,b){function c(a){b.html(a)}function d(a){c(moment(a).isBefore(moment().subtract(1,"years"))?moment(a).format("YYYY"):moment(a).fromNow())}d(a.timeAgo)}}});