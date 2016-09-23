import Wheel from './Wheel';

class Car {
  constructor(color) {
    this.wheel = new Wheel();
    console.log(`es6 class - ${color} car constructor`); // eslint-disable-line
  }

  drive() {
    console.log('es6 class - car method'); // eslint-disable-line
  }

}

export default Car;