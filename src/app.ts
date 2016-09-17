import routes = require('./routes');
//import Car = require('./Car');
import ClownCar = require('./ClownCar');
import Car from './Car';

const foo: string = 'bar';


const myCar = new Car('blue');
const car = new ClownCar('red');

//const otherCar = new Car('red');

console.log('hello world');


routes();
