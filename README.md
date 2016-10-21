# README #

This is a pre-configured gulp setup for getting up and running quickly with either a new or existing typescript or es2017 node.js application (both are supported). 
The intent of this repository is to either help quickly create a new application with a build process, or **install a build process** into an existing application with a simple NPM install and a few minor config changes, instead of having to write your own configs from scratch.

This package has a ton of dependencies, but none of them will run in your production code.

Due to a security vulnerability, temporarily we need you to install some dev dependencies on your own (and of course at your own risk)
See this link for more info. https://nodesecurity.io/advisories/118

Install these by adding them to devDependencies in package.json and running $ npm i

    "gulp": "^3.9.1",
    "gulp-istanbul": "^1.1.1",
    "gulp-nodemon": "^2.2.1",
    "gulp-exclude-gitignore": "^1.0.0"

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

//please read above!

$ npm i --save-dev gulp-build-config

```

### Usage ###

```js

// gulpfile.js
const gulp = require('gulp');

const GulpConfig = require('gulp-build-system');
const gulpConfig = new GulpConfig(gulp);
gulpConfig.initialize();

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
These come out of the box. Namespacing is available via configuration.
* **clean**: clears the lib folder
* **clean:dist**: clears the dist folder


## configuration

How to persionalize:

All configuration is done by using the provided setter API. Do not overwrite!

```js
//setter api
gulpConfig.config({
    key: value
})

//In order to namespace:
prefix //string - defines namespace for all gulpconfig.

```

* **file**: namespaces generated gulp tasks
* **url**: The url loader works like the file loader, but can return a Data Url if the file is smaller 

## Prior Art
* [`react-slingshot`](https://github.com/coryhouse/react-slingshot) - Corey House