var cache = new LastFMCache();

var lastfm = new LastFM({
apiKey : 'fbd77c792fee9294d1706b5a65d1cb78',
apiSecret : 'a8148b72b0b56153dc5fc7315c7d0780',
cache : cache
});

lastfm.artist.search({artist: 'Dave Koz'}, {success: function(data){
	console.log(data.results.artistmatches.artist[0].name);
}, error: function(code, message) {
	/* Show error message. */
}});

var engine = new Bloodhound({
  name: 'artists',
  remote: {
  	url: 'http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=%QUERY&api_key=fbd77c792fee9294d1706b5a65d1cb78&format=json',
  	filter: function(artists) {
  		return $.map(artists.results, function (artist) {
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

$('.typeahead').typeahead(null, {
	source: engine.ttAdapter(),
});

// lastfm.artist.getInfo({artist: 'Dave Koz'}, {success: function(data){
// 		console.log(data.artist.bio.content);
//     }, error: function(code, message) {
//     /* Show error message. */
// }});