'use strict';

var through = require('through');
var Decoder = require('string_decoder').StringDecoder;

module.exports = function(parse) {
  var decoder = new Decoder();
  var soFar = '';

  function emit(stream, piece) {
    if(!parse) {
      return stream.queue(piece);
    }

    try {
      piece = parse(piece);
    } catch (err) {
      return;
    }

    if('undefined' !== typeof piece) {
      stream.queue(piece);
    }    
  }

  var next = function(stream, buffer) {
    var pieces = ((soFar != null ? soFar : '') + buffer).split(/\r?\n/);
    soFar = pieces.pop();

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      emit(stream, piece);
    }
  };

  return through(function(data) {
    next(this, decoder.write(data));
  }, function() {
    if(decoder.end) {
      next(this, decoder.end());
    }
    this.queue(null);
  });
}
