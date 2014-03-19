var cache = new LastFMCache();

var lastfm = new LastFM({
	apiKey: 'fbd77c792fee9294d1706b5a65d1cb78',
	apiSecret: 'a8148b72b0b56153dc5fc7315c7d0780',
	cache: cache
});

/* Bloodhound suggestion engine */
var artistEngine = new Bloodhound({
	name: 'artist',
	remote: {
		url: 'http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=%QUERY&api_key=fbd77c792fee9294d1706b5a65d1cb78&format=json',
		filter: function(data) {
			return $.map(data.results.artistmatches.artist, function(artist) {
				console.log(artist);
				return {
					value: artist.name
				};
			});
		}
	},
	datumTokenizer: function(d) { 
		return Bloodhound.tokenizers.whitespace(d.val); 
	},
	queryTokenizer: Bloodhound.tokenizers.whitespace
});

artistEngine.initialize();

$(document).ready(function() {
	
	/* Typeahead search box */
	$('.typeahead').typeahead(
		{
			highlight: true
		},
 		{
 			name: 'artists',
			source: artistEngine.ttAdapter()
		}
	);

	/* Submission */
	$('#submit').click(function() {
		var artistName = $('#input').val();
		console.log(artistName);

		/* Load artist info. */
		lastfm.artist.getInfo(
			{artist: artistName},
			{
				success: function(data) {
  					/* Use data. */
  					console.log(data);
				},
				error: function(code, message) {
  					/* Show error message. */
				}
			}
		);

		/* Load artist events */
		lastfm.artist.getEvents(
			{artist: artistName},
			{
				success: function(data) {
					/* Use data */
					console.log(data.events.event[0].venue.location['geo:point']);
					coords = data.events.event[0].venue.location['geo:point'];
					initMap();
				},
				error: function(code, message) {
					/* Show error message. */
				}
			}
		);
	});

});

/* Google Maps API */

function initMap() {

	var location = new google.maps.LatLng(coords['geo:lat'], coords['geo:long']);
  	var mapOptions = {
    	zoom: 8,
    	center: location
  	};

  	var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  	var marker = new google.maps.Marker({
  		position: location,
  		map: map,
  		title:"Next Event"
  	});

  	var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
      '<div id="bodyContent">'+
      '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
      'sandstone rock formation in the southern part of the '+
      'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
      'south west of the nearest large town, Alice Springs; 450&#160;km '+
      '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
      'features of the Uluru - Kata Tjuta National Park. Uluru is '+
      'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
      'Aboriginal people of the area. It has many springs, waterholes, '+
      'rock caves and ancient paintings. Uluru is listed as a World '+
      'Heritage Site.</p>'+
      '<p>Attribution: Uluru, <a href="http://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
      'http://en.wikipedia.org/w/index.php?title=Uluru</a> '+
      '(last visited June 22, 2009).</p>'+
      '</div>'+
      '</div>';

  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}
