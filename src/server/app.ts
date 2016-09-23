import routes = require('./routes');

import Car from './Car';
import ClownCar = require('./ClownCar');

const car = new Car('blue');
const clownCar = new ClownCar('red');

console.log('hello main');

routes();
