const fs = require('fs');
const babelConfig = JSON.parse(fs.readFileSync('./.babelrc'));
require('babel-register')(babelConfig);
require('babel-polyfill');

const gulp = require('gulp');

const GulpConfig = require('./src/gulpConfig');
const gulpConfig = new GulpConfig(gulp);

gulpConfig.setConfig({
  nspEnabled: false
});

gulpConfig.init();
