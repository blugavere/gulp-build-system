"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Car = require('./Car');
var Wheel_1 = require('./Wheel');
var ClownCar = (function (_super) {
    __extends(ClownCar, _super);
    function ClownCar(color) {
        _super.call(this, color);
        console.log('supz');
        this.wheelz = new Wheel_1["default"]();
        this.wheelz.spin();
    }
    return ClownCar;
}(Car));
exports.__esModule = true;
exports["default"] = ClownCar;

//# sourceMappingURL=ClownCar.js.map
