'use strict';

var Horn = require('./Horn').default;

var register = function register() {
  console.log('route!!');
  var horn = new Horn();
};

module.exports = register;