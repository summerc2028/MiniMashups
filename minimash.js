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

		/* Load some artist info. */
		lastfm.artist.getInfo(
			{artist: artistName},
			{
				success: function(data) {
  					/* Use data. */
				},
				error: function(code, message) {
  					/* Show error message. */
				}
			}
		);
	});

});

/* Google Maps API */
google.maps.event.addDomListener(window, 'load', initialize);
function initialize() {
  	var mapOptions = {
    	zoom: 8,
    	center: new google.maps.LatLng(-34.397, 150.644)
  	};

  	var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
	}
