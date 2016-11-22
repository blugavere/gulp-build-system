# README #

This is a pre-configured gulp setup for getting up and running quickly with either a new or existing typescript or ES2017 node.js application (both are supported). 

This package has a bunch of dependencies but none of them will run in your production code.

Standalone, this package is designed to be imported into an existing application. If you are starting a new application,
feel free to use the associated yeoman generator to scaffold a brand new web application for you, using this package.

[`generator-gbs-starter`](https://github.com/blugavere/generator-gbs-starter)

```
An important assumption in using this tool is that is that your code already is 
(or you're willing to make it) build-friendly, such as in a structure similar to below.
  src/ <- where you house your source code, (typescript, ES7, etc - code that may not run in all browsers)
    server/
        app.js
    client/
        index.js
  lib/ <- where your files get built to, so that you can run them in a development environment
  dist/ <- where built / minified files are generated for production deployment  
  .gitignore (required)
  .gulpfile.js
  .package.json
  ...etc

The file paths above are configurable, however, we're also assuming there's a separation between client 
and server code for your app. If you are looking for something isomorphic or universal, this probably isn't
your best choice of build configuration.

```

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

// end gulpfile.js

// add npm script --> "dev": "gulp dev"

// run your code
$ npm run dev

// test 
$ gulp test

// test watch
$ gulp watch

// deploy to npm (be careful!)
$ npm publish

```

## Commands
These come out of the box. Namespacing is available via configuration. From cli, type: gulp [command]

* **clean**: clears the lib and dist folder
* **clean:lib**: clears the lib folder
* **clean:dist**: clears the dist folder
* **dev**: start up dev server
* **build:lib**: development build
* **build:dist**: production build
* **test**: run unit tests
* **test:watch**: run unit tests - watching
* **nsp**: check security vulnerabilities of deps
* **prepublish**: check security, production build

## Configuration

How to persionalize:

All configuration is done by using the provided setter API. Do not overwrite!

```js
// setter api
gulpConfig.setConfig({
    key: value
});

// example:
gulpConfig.setConfig({
    clientEntry: './src/public/app.js',
    serverEntry: './src/server/app.js'
});


```

**Options**
Have fun!
* serverEntry - entry point for the server app. **Important:** this must be in the root of your server-side directory.
    * type: string
    * example: './src/server/app.js'
* clientEntry - entry point for the client app. **Important:** this must be in the root of your client-side directory.
    * type: string
    * example: './src/client/app.js'
* nspEnabled - whether or not to check your project dependencies for vulnerabilities before publishing
    * type: bool


## Contributing

```sh
$ npm i
$ typings i
$ npm run dev
```

## TODOS
Stuff you can help with.
* Enable more configuration
* Enable disabling stuff
* Server side build option
* Enable disabling some features
* Make more modular and pluggable
* Keep up with evolving technologies
* Build out sample app.

## Prior Art
* [`react-slingshot`](https://github.com/coryhouse/react-slingshot) - Corey House