var http = require('http');
var url  = require('url');

var BBCRadioProxy = function () {
  
  self = this;
  
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

  http.createServer(this.handlRequest)
      .listen(this.options.port, this.options.hostname);

};

/**
 * Handles each HTTP request
 *
 **/
BBCRadioProxy.prototype.handlRequest = function (request, response) {
  
  self.request  = request;
  self.response = response;
  
  var stationName = self.stationName(self.request.url);
  
  console.log('"'+stationName+'" requested');
  
  if (self.stationExists(stationName)) {
    self.requestStreamPls(stationName);
  } else {
    self.notFound("Unknown station: " + stationName);
  }
};

/**
 * Extracts the path name without the leading slash
 *
 **/
BBCRadioProxy.prototype.stationName = function (u) {
  return url.parse(u).pathname.substring(1);
};

/**
 * Return a 404
 *
 **/
BBCRadioProxy.prototype.notFound = function (msg) {
  msg = msg || "Not found";

  self.response.writeHead(404, {
    'Content-Type':   'text/plain',
    'Content-Length': msg.length
  });
  self.response.write(msg);
  self.response.end();
};

/**
 * Tests if the given station name is known
 *
 **/
BBCRadioProxy.prototype.stationExists = function (n) {

  var k = Object.keys(self.options.bbc.stations);
  var i = k.indexOf(n);
  return i >= 0;
};

/**
 * Requests the PLS file from the BBC and passes it to parsePlsAndRedirect
 *
 **/
BBCRadioProxy.prototype.requestStreamPls = function (n) {
  
  var requestOpts = {
    'host':     self.options.bbc.hostname,
    'port':     self.options.bbc.port,
    'method':   self.options.bbc.method,
    'path':     self.options.bbc.stations[n],
    'agent':    false
  };
  
  console.log(JSON.stringify(requestOpts));
  
  var req = http.request(requestOpts, function (r) {
    r.setEncoding('utf8');
    r.on('data', self.parsePlsAndRedirect);
  });

  req.on('error', function (e) {
    console.log(JSON.stringify(e));
    self.notFound(e.message);
  });
  
  req.end();
};

/**
 * Parse the given chunk (r) as a PLS, extract the stream URL and redirect
 *
 **/
BBCRadioProxy.prototype.parsePlsAndRedirect = function (r) {
  var m = r.match(/File\d=(.+)/im);
  self.response.writeHead(302, { "Location": m[1] });
  self.response.end();
};

// Let's fire this puppy up
new BBCRadioProxy();
