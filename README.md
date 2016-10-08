# README #

This is a pre-configured gulp setup for getting up and running quickly with either a new or existing typescript or es2017 node.js application (both are supported). 
The intent of this repository is to either help quickly create a new application with a build process, or **install a build process** into an existing application with a simple NPM install and a few minor config changes, instead of having to write your own configs from scratch.

This package has a ton of dependencies, but none of them will run in your production code.
### TODOS ###
* Implement file cache for faster compilation
* Separate out server-build/watch process from client build/watch process so that server doesn't recompile on client changes (and visa versa)

### How do I get set up? ###

```sh
$ npm i
$ typings i
$ npm run dev
```
### Installation ###

```js

$ npm i --save-dev gulp-build-config

```

### Usage ###

```js

// gulpfile.js
const gulp = require('gulp');

const GulpConfig = require('./src/gulpConfig');
const gulpConfig = new GulpConfig(gulp);
gulpConfig.initialize();

/**
* assumption is that your code is in the below structure: 
* src/
*   server/
*   client/
* 
* the below code is not required if you follow this convention.
*/
gulpConfig.config({ allJs: 'src/**/*.js', allTs: 'src/**/*.ts')

//add npm script --> "dev": "gulp dev"

//run your code
$ npm run dev

//test 
$ gulp test

//test watch
$ gulp watch

//deploy to npm (be careful!)
$ npm publish

```