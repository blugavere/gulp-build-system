const fs = require('fs');
const del = require('del');
const babel = require('gulp-babel');
const print = require('gulp-print');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const tsProject = ts.createProject('tsconfig.json');

//require('babel-register')(babelConfig);
//require('babel-polyfill');
//const install = require('gulp-install');
//const plumber = require('gulp-plumber');
//const inject = require('gulp-inject');
//const istanbul = require('gulp-istanbul');
//const Cache = require('gulp-file-cache');
//const path = require('path');
//const colors = require('colors');

//const eslintConfig = require('./.eslintrc');

class GulpConfig {
  constructor(gulp) {
    this.gulp = gulp;
    this.babelConfig = JSON.parse(fs.readFileSync('../.babelrc'));
    this.tslintConfig = require('../tslint');

    this.babel = this.babel.bind(this);
    this.config = this.config.bind(this);
    this.initialize = this.initialize.bind(this);
    this.tslint = this.tslint.bind(this);

    this._config = {
      allJs: 'src/**/*.js',
      allTypeScript: 'src/**/*.ts',
      libraryTypeScriptDefinitions: 'typings/**/*.d.ts',
      tsOutputPath: 'build',
      typings: './typings/',
      defs: 'release/definitions',
      serverMain: 'build/server/app.js'
    };

  }

  babel(config) {
    this.babelConfig = config;
  }

  config(config) {
    this._config = Object.assign({}, this._config, config);
  }

  tslint(config) {
    this.tslintConfig = config;
  }



  initialize() {
    //const self = this;
    const { _config, babelConfig, gulp, tslintConfig } = this;
    const prefix = 'gulpconfig:';

    /**
     * watch task
     */
    //TODO: watch only client code.
    gulp.task(`${prefix}watch`, function () {
      gulp.watch(_config.allJs, [`${prefix}js`]);
      gulp.watch(_config.allTypeScript, [`${prefix}ts`]);
    });

    /**
     * Compile TypeScript and include references to library and app .d.ts files.
     */
    gulp.task(`${prefix}ts-compile`, function () {

      const sourceTsFiles = [
        _config.allTypeScript,   //path to typescript files
        //config.libraryTypeScriptDefinitions  //reference to library .d.ts files
      ];

      const tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

      tsResult.dts.pipe(gulp.dest(_config.tsOutputPath));

      return tsResult.js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(_config.tsOutputPath));

    });

    /**
     * Compile javascript through babel.
     */
    const jsTask = `${prefix}js`;
    gulp.task(`${prefix}js`, function () {
      return gulp.src(_config.allJs)
        .pipe(print())
        //.pipe(cache.filter())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(babel(babelConfig))
        //.pipe(cache.cache())
        .pipe(gulp.dest('build'));
    });


    gulp.task(`${prefix}ts`, [`${prefix}ts-lint`, `${prefix}ts-compile`]);
    gulp.task(`${prefix}compile`, [`${prefix}ts`, jsTask]);
    gulp.task(`${prefix}build`, [`${prefix}clean`, `${prefix}ts`, jsTask]);

    //TODO: watch only server code.
    gulp.task(`${prefix}dev`, [`${prefix}clean`, `${prefix}compile`], () => { // 'start'
      nodemon({
        script: _config.serverMain, // run ES5 code 
        watch: 'src/server/**.*', // watch ES2015 code 
        tasks: [`${prefix}compile`] // compile synchronously onChange 
      });
    });

    /**
    * Completed
    */

    /**
     * Lint all custom TypeScript files.
     */
    gulp.task(`${prefix}ts-lint`, function () {
      return gulp.src(_config.allTypeScript)
        .pipe(tslint({
          formatter: 'verbose',
          configuration: tslintConfig
        })).pipe(tslint.report());
    });

    gulp.task(`${prefix}clean`, function () {
      return del.sync(['build/**']);
    });

  }

}

module.exports = GulpConfig;
