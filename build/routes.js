'use strict';

var _Horn = require('./Horn');

var _Horn2 = _interopRequireDefault(_Horn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var register = function register() {
  console.log('route!!');
  var horn = new _Horn2.default();
}; //const Horn = require('./Horn').default;


module.exports = register;