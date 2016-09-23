import routes = require('./routes');
//import Car = require('./Car');
import ClownCar = require('./ClownCar');
import Car from './Car';

const foo: string = 'bar';


const car = new Car('blue');
const clownCar = new ClownCar('red');

console.log('hello world');


routes();
