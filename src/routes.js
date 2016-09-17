const Horn = require('./Horn').default;

const register = () => {
  console.log('route!!');
  const horn = new Horn();
};

module.exports = register;