# README #

This is a pre-configured gulp setup for getting up and running quickly with either a new or existing typescript or es2017 node.js application (both are supported). 

This package has a ton of dependencies, but none of them will run in your production code.

Standalone, this package is designed to be imported into an existing application. If you are starting a new application,
feel free to use the associated yeoman generator to scaffold a brand new web application for you, using this package.

[`generator-gbs-starter`](https://github.com/blugavere/generator-gbs-starter)

### Installation ###

```js

$ npm i --save-dev gulp@github:gulpjs/gulp#4.0 gulp-build-config

```

### Usage ###
Create a gulpfile (gulpfile.js) and add the below code into it.

```js

// gulpfile.js
const gulp = require('gulp');

const GulpConfig = require('gulp-build-system');
const gulpConfig = new GulpConfig(gulp);
gulpConfig.init();

/**
* assumption is that your code is in the below structure: 
* src/
*   server/
*     app.js
*   client/
* .gitignore (required)
* .gulpfile.js
* .package.json
* the below code is not required if you follow this convention.
*/

gulpConfig.config({ allJs: 'src/**/*.js', allTs: 'src/**/*.ts'});

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

## Commands
These come out of the box. Namespacing is available via configuration. From cli, type: gulp [command]

* **clean**: clears the lib and dist folder
* **clean:lib**: clears the lib folder
* **clean:dist**: clears the dist folder
* **dev**: start up dev server
* **build:dist**: production build
* **test**: run unit tests
* **test:watch**: run unit tests - watching
* **nsp**: check security vulnerabilities of deps
* **prepublish**: check security, production build

## Configuration

How to persionalize:

All configuration is done by using the provided setter API. Do not overwrite!

```js
//setter api
gulpConfig.setConfig({
    key: value
});

//In order to namespace:
prefix //string - defines namespace for all gulpconfig.

```

* **file**: namespaces generated gulp tasks
* **url**: The url loader works like the file loader, but can return a Data Url if the file is smaller 

### Contributing ###

```sh
$ npm i
$ typings i
$ npm run dev
```

### TODOS ###
* Enable more configuration
* Clean up dependencies not being used
* Enable disabling stuff
* Server side build option
* Enable disabling some features
* Make more modular and pluggable
* Keep up with evolving technologies
* Build out sample app.

## Prior Art
* [`react-slingshot`](https://github.com/coryhouse/react-slingshot) - Corey House