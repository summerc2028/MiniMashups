var cache = new LastFMCache();

var lastfm = new LastFM({
apiKey : 'fbd77c792fee9294d1706b5a65d1cb78',
apiSecret : 'a8148b72b0b56153dc5fc7315c7d0780',
cache : cache
});

lastfm.artist.getInfo({artist: 'Dave Koz'}, {success: function(data){
/* Use Data */
	console.log(data.bio);
    }, error: function(code, message){
    /* Show error message. */
 }});