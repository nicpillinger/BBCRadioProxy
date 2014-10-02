var http = require('http'),
    url  = require('url');

var BBCRadioProxy = function () {

  this.options = {
    'port':       process.argv[2] || 8000,
    'host':       process.argv[3] || false,
    'bbc': {
      'hostname':   'open.live.bbc.co.uk',
      'port':       80,
      'method':     'GET',
      'stations': {
        'r1':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_one/format/pls.pls',
        'r2':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_two/format/pls.pls',
        'r3':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_three/format/pls.pls',
        'r4':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_fourfm/format/pls.pls',
        'r5':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_five_live/format/pls.pls',
        'r5se':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_radio_five_live_sports_extra/format/pls.pls',
        'r6':       '/mediaselector/5/select/mediaset/http-icy-aac-lc-a/vpid/bbc_6music/format/pls.pls'
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
