# README #

This is a starter pack for getting up and running quickly with a hybrid typescript and es2017 node.js application. The intent of this repository is to create portable code that can help ease the migration from purely javascript to a hybrid application, and then eventually fully typescript if you so choose.

### TODOS ###
* Implement file cache for faster compilation
* Implement dependency injection for gulp decoration
* Build out sample client-side application
* Implement isomorphic react/redux
* Integrate instanbul for code-coverage reports and TDD
* Separate out server-build/watch process from client build/watch process so that server doesn't recompile on client changes (and visa versa)
* Create deployment process whereby dist folder is populated with server-side compiled code and client folder is populated with bundled minified production ready code.

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
gulp watch

//deploy to npm (be careful!)
npm publish
```