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
				//console.log(artist);
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

		/* Load artist info. */
		lastfm.artist.getInfo(
			{artist: artistName},
			{
				success: function(data) {
					/* Use data. */
					//console.log(data);
					var onTour = data.artist.ontour;
					$('#map-canvas').remove();
					$('#artist-name').remove();
					$('#profile-pic').remove();
					$('#extended-bio').remove();
					$('#info-container').append('<div id="map-canvas"></div>');
					$('#bio-container').append('<div id="artist-name"></div>');
					$('#bio-container').append('<div id="profile-pic"></div>');
					$('#bio-container').append('<div id="extended-bio"></div>');
					/* Create Artist Bio */
					var nameArtist = data.artist.name;
					var photo = data.artist.image[3]['#text'];
					console.log(photo);
					var bio = data.artist.bio.summary;
					loadBio(nameArtist,photo,bio);
					if (onTour == 1) {
						/* Load artist events */
						lastfm.artist.getEvents(
							{artist: artistName},
							{
								success: function(data) {
									/* Display map */
									//console.log(data);
									var locData = data.events.event[0].venue;
									var heading = data.events.event[0].venue.name;
									var content = data.events.event[0].venue.location;
									initMap(locData);
								},
								error: function(code, message) {
									/* Show error message. */
									/* This should never execute */
								}
							}
						);
					} else {
						/* Handle event that there are no tour dates */
						$('#map-canvas').append('<img src="http://www1.pcmag.com/media/images/344452-twitter-fail-whale-for-sw.jpg?thumb=y">');
						$('#map-canvas').append('<div class="alert alert-danger">No Tour Dates Currently Available</div>');
					}
				},
				error: function(code, message) {
					/* Artist does not exist */
					$('#map-canvas').append('<img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcReXMdEp1IseBTL0S-_x1_pMg22QQ1lxQ9jDoomYHhIDx_1AWIB">');
					$('#map-canvas').append('<div class="alert alert-danger">The Artist Does Not Exist... You Fool!</div>');
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

	var infowindow = new google.maps.InfoWindow(
		{
			content: contentString,
			maxWidth: 325
		}
	);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	});
}

/* Artist Bio */

function loadBio(nameArtist,photo,bio){
	$('#artist-name').append('<h1 id="artistHead">'+nameArtist+'</h1>');
	$('#profile-pic').append('<img src="'+photo+'" alt="Profile Pic">');
	$('#extended-bio').append('<p id="artistBio">'+bio+'</p>');
	$('#extended-bio').append('<hr />');

}
