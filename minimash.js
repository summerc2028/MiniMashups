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
					var onTour = data.artist.ontour;
					$('#map-canvas').remove();
					$('#info-container').append('<div id="map-canvas"></div>');
					if (onTour == 1) {
						/* Load artist events */
						lastfm.artist.getEvents(
							{artist: artistName},
							{
								success: function(data) {
									/* Display map */
									console.log(data.events.event[0].venue);
									var locData = data.events.event[0].venue;
									var heading = data.events.event[0].venue.name;
									var content = data.events.event[0].venue.location;
									initMap(locData);
								},
								error: function(code, message) {
									/* Show error message. */
								}
							}
						);
					} else {
						/* Handle event that there are no tour dates */
					}
				},
				error: function(code, message) {
					/* Show error message. */
				}
			}
		);
	});
});

/* Google Maps API */

function initMap(locData) {

	/* Location coordinates */
	var coords = locData.location['geo:point'];

	/* Location metadata */
	var heading = locData.name;
	var content = locData.location.street;
	var cityCountryZip = locData.location.city + ', ' + locData.location.country + "\t" + locData.location.postalcode;
	var phone = 'Phone: ' + locData.phonenumber;
	var website = 'URL: <a href="' + locData.url + '">' + locData.url + '</a>';

	/* Draw map */
	var location = new google.maps.LatLng(coords['geo:lat'], coords['geo:long']);
	var mapOptions = {
		zoom: 8,
		center: location
	};

	var map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	/* Place marker */
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		title:"Next Event"
	});

	/* Set popup content */
	var contentString = '<div id="content"><h1 id="firstHeading" class="firstHeading">'
	+ heading + '</h1><div id="bodyContent"><p>' + content + '</p><p>' + cityCountryZip + '</p><p>' + phone + '</p><p>' + website + '</p></div></div>';

	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	});
}
