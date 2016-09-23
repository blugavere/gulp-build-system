import Car from './Car';
import Wheel = require('./Wheel');

class ClownCar extends Car {
  private wheel: Wheel;

  constructor(color: string){
    super(color);
    console.log('typescript class - clowncar'); // eslint-disable-line
    this.wheel = new Wheel();
    this.wheel.spin();
  }
}

export = ClownCar;