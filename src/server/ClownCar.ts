//import Car = require('./Car');
import Car from './Car';
//import Wheel from './Wheel';
import Wheel = require('./Wheel');

class ClownCar extends Car {
  private wheelz: Wheel;

  constructor(color: string){
    super(color);
    console.log('supz');
    this.wheelz = new Wheel();
    this.wheelz.spin();
  }
}

export = ClownCar;