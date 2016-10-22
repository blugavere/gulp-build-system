declare var require: any;
declare var process: any;
declare var __dirname: string;

import routes = require('./routes');
import Car from './Car';
import ClownCar = require('./ClownCar');
const path = require('path');
const car = new Car('blue');
const clownCar = new ClownCar('red');
require('colors');
//console.log('hello main');

routes();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(port, () => {
  console.log('Example app listening on port 3000!');
});