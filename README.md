BBCRadioProxy
=============

BBCRadioProxy is a simple Javascript mini-server designed for use with MPD.

Run the server with NodeJS:

    $ node BBCRadioProxy [ port number to listen to [ ip to listen on] ] 
    
By default, the proxy listens on all interfaces on port 8000.

Update your BBC radio playlists to point at `http://[your mpd server's ip]/[stationname]`. Right now, the proxy knows about:

 - Radio 1 (proxy path: `/r1`)