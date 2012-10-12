BBCRadioProxy
=============

BBCRadioProxy is a simple Javascript HTTP mini-server designed work around the tokenised URLs for BBC's web streams of
their radio stations, for use with MPD.

The server provides a proxied facade URI for existing streams and:

 - Extracts the tokenised URI from the pls file provided by the BBC
 - Returns with an HTTP 302 redirect to the tokenised URI

Run the server with NodeJS:

    $ node BBCRadioProxy [ port number to listen to [ ip to listen on] ] 
    
By default, the proxy listens on all interfaces on port 8000.

Update your BBC radio playlists to point at `http://[your mpd server's ip]/[stationname]`.

So, for example, my entry for Radio 1 looks like this:

    #EXTM3U
    #EXTINF:-1, BBC - BBC Radio 1
    http://192.168.1.238:8000/r1

Right now, the proxy knows about:

<table>
    <thead><tr>
        <th scope="col">Station</th>
        <th scole="col">Proxy path</th>
    </tr></thead>
    <tbody>
        <tr>
            <td>BBC Radio 1</td>
            <td>`/r1`</td>
        </tr>
        <tr>
            <td>BBC Radio 2</td>
            <td>`/r2`</td>
        </tr>
        <tr>
            <td>BBC Radio 3</td>
            <td>`/r3`</td>
        </tr>
        <tr>
            <td>BBC Radio 4</td>
            <td>`/r4`</td>
        </tr>
        <tr>
            <td>BBC Radio 5Live</td>
            <td>`/r5`</td>
        </tr>
        <tr>
            <td>BBC Radio 5Live Sports Extra</td>
            <td>`/r5se`</td>
        </tr>
        <tr>
            <td>BBC Radio 6Music</td>
            <td>`/r6`</td>
        </tr>
    </tbody>
</table>
