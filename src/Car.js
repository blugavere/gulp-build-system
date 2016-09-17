import Wheel from './Wheel';

class Car {
  constructor(color) {
    this.wheel = new Wheel();
    console.log(`${color} car built!`);
  }
  drive(){
    console.log('driving');
  }
}

module.exports = Car;