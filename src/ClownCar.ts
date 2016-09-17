import Car = require('./Car');
import Wheel from './Wheel';

class ClownCar extends Car {
  private wheelz: Wheel;

  constructor(color: string){
    super(color);
    console.log('supz');
    this.wheelz = new Wheel();
    this.wheelz.spin();
  }
}

export default ClownCar;