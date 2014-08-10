var http = require('http'),
    url  = require('url');

var BBCRadioProxy = function () {

  this.options = {
    'port':       process.argv[2] || 8000,
    'host':       process.argv[3] || false,
    'bbc': {
      'hostname':   'www.bbc.co.uk',
      'port':       80,
      'method':     'GET',
      'stations': {
        'r1':       '/radio/listen/live/r1_heaacv2.pls',
        'r2':       '/radio/listen/live/r2_heaacv2.pls',
        'r3':       '/radio/listen/live/r3_heaacv2.pls',
        'r4':       '/radio/listen/live/r4_heaacv2.pls',
        'r5':       '/radio/listen/live/r5_heaacv2.pls',
        'r5se':     '/radio/listen/live/r5lsp_heaacv2.pls',
        'r6':       '/radio/listen/live/r6_heaacv2.pls'
      }
    }
  };

  console.log('Starting server on ' + this.options.hostname + ':' +this.options.port);

  http.createServer(this.handlRequest.bind(this))
      .listen(this.options.port, this.options.hostname);

};

/**
 * Handles each HTTP request
 *
 **/
BBCRadioProxy.prototype = {

  handlRequest: function (request, response) {

    this.request  = request;
    this.response = response;

    var stationName = this.stationName(this.request.url);

    console.log('"'+stationName+'" requested');

    if (this.stationExists(stationName)) {
      this.requestStreamPls(stationName);
    } else {
      this.notFound("Unknown station: " + stationName);
    }
  },


  stationName: function (u) {
    return url.parse(u).pathname.substring(1);
  },

  notFound: function (msg) {
    msg = msg || "Not found";

    this.response.writeHead(404, {
      'Content-Type':   'text/plain',
      'Content-Length': msg.length
    });
    this.response.write(msg);
    this.response.end();
  },

  stationExists: function (n) {

    var k = Object.keys(this.options.bbc.stations);
    var i = k.indexOf(n);
    return i >= 0;
  },


  requestStreamPls: function (n) {

    var requestOpts = {
      'host':     this.options.bbc.hostname,
      'port':     this.options.bbc.port,
      'method':   this.options.bbc.method,
      'path':     this.options.bbc.stations[n],
      'agent':    false
    };

    console.log(JSON.stringify(requestOpts));

    var req = http.request(requestOpts, function (r) {
      r.setEncoding('utf8');
      r.on('data', this.parsePlsAndRedirect.bind(this));
    }.bind(this));

    req.on('error', function (e) {
      console.log(JSON.stringify(e));
      this.notFound(e.message);
    }.bind(this));

    req.end();
  },


  parsePlsAndRedirect: function (r) {
    var m = r.match(/File\d=(.+)/im);
    this.response.writeHead(302, { "Location": m[1] });
    this.response.end();
  }

};

new BBCRadioProxy();
