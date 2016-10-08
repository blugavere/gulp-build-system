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
const excludeGitignore = require('gulp-exclude-gitignore');
const plumber = require('gulp-plumber');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');
const path = require('path');
const appRoot = require('app-root-path');
const coveralls = require('gulp-coveralls');

const nsp = require('gulp-nsp');
//const eslintConfig = require('./.eslintrc');
//const install = require('gulp-install');
//const colors = require('colors');
//const Cache = require('gulp-file-cache');
//const inject = require('gulp-inject');

class GulpConfig {
  constructor(gulp) {
    this.gulp = gulp;
    this.babelConfig = JSON.parse(fs.readFileSync('./.babelrc'));
    this.tslintConfig = require('../tslint');

    this.babel = this.babel.bind(this);
    this.config = this.config.bind(this);
    this.initialize = this.initialize.bind(this);
    this.tslint = this.tslint.bind(this);

    this._config = {
      prefix: 'gulpconfig:',
      allJs: 'src/**/*.js',
      allTs: 'src/**/*.ts',
      libraryTypeScriptDefinitions: 'typings/**/*.d.ts',
      outputPath: 'lib',
      deployPath: 'dist',
      typings: './typings/',
      defs: 'release/definitions',
      serverMain: '/server/app.js',
      serverWatch: '/server/**.*'
    };
    this._config.appRoot = appRoot.path;
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
    const { _config, _config: { prefix }, babelConfig, gulp, tslintConfig } = this;

    /**
     * testing
     */
    gulp.task('pre-test', function () {
      return gulp.src([
        `${_config.outputPath}/**/*.js`,
        `!${_config.outputPath}/**/*.test.js`,
      ]
        )
        .pipe(excludeGitignore())
        .pipe(istanbul({
          includeUntested: true,
          instrumenter: isparta.Instrumenter
        }))
        .pipe(istanbul.hookRequire());
    });

    gulp.task('test', ['pre-test'], function (cb) {
      var mochaErr;

      gulp.src(`${_config.outputPath}/**/*.test.js`)
        .pipe(plumber())
        .pipe(mocha({reporter: 'spec'}))
        .on('error', function (err) {
          mochaErr = err;
        })
        .pipe(istanbul.writeReports())
        .on('end', function () {
          cb(mochaErr);
        });
    });

    /** 
     * security
     */
    gulp.task('nsp', function (cb) {
      nsp({package: path.join(_config.appRoot, 'package.json')}, cb);
    });

    /**
     * deployment
     */
    const buildDist = `${prefix}build:dist`;
    gulp.task(buildDist, [`${prefix}clean:dist`, `${prefix}build`], function () {
      return gulp.src(`${_config.outputPath}/**/*.js`)
        .pipe(babel())
        .pipe(gulp.dest(_config.deployPath));
    });

    gulp.task('coveralls', ['test'], function () {
      if (!process.env.CI) {
        return;
      }
      return gulp.src(path.join(_config.appRoot, 'coverage/lcov.info'))
        .pipe(coveralls());
    });

    /**
     * WARN: these is are defaults. if you want to have your own stuff, overwrite this.
     */
    gulp.task('prepublish', ['nsp', buildDist]);
    gulp.task('default', [`${prefix}compile`, 'test', 'coveralls']);

    /**
     * watch task
     */
    //TODO: watch only client code.
    gulp.task(`${prefix}watch`, function () {
      gulp.watch(_config.allJs, [`${prefix}js`]);
      gulp.watch(_config.allTs, [`${prefix}ts`]);
    });

    /**
     * Compile TypeScript and include references to library and app .d.ts files.
     */
    gulp.task(`${prefix}ts-compile`, function () {

      const sourceTsFiles = [
        _config.allTs,   //path to typescript files
        //config.libraryTypeScriptDefinitions  //reference to library .d.ts files
      ];

      const tsResult = gulp.src(sourceTsFiles)
        .pipe(excludeGitignore())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

      tsResult.dts.pipe(gulp.dest(_config.outputPath));

      return tsResult.js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(_config.outputPath));

    });

    /**
     * Compile javascript through babel.
     */
    const jsTask = `${prefix}js`;
    gulp.task(jsTask, function () {
      return gulp.src(_config.allJs)
        .pipe(excludeGitignore())
        .pipe(print())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(_config.outputPath));
    });

    const tsTask = `${prefix}ts`;
    gulp.task(tsTask, [`${prefix}ts-lint`, `${prefix}ts-compile`]);
    const compileTask = `${prefix}compile`;
    gulp.task(compileTask, [tsTask, jsTask]);
    gulp.task(`${prefix}build`, [`${prefix}clean`, tsTask, jsTask]);

    //TODO: watch only server code.
    gulp.task('dev', [`${prefix}clean`, compileTask], () => { // 'start'
      nodemon({
        script: `${_config.outputPath}${_config.serverMain}`, // run ES5 code 
        watch: 'src/server/**.*', // watch ES2015 code 
        tasks: [compileTask] // compile synchronously onChange 
      });
    });

    /**
    * Completed
    */

    /**
     * Lint all custom TypeScript files.
     */
    gulp.task(`${prefix}ts-lint`, function () {
      return gulp.src(_config.allTs)
        .pipe(tslint({
          formatter: 'verbose',
          configuration: tslintConfig
        })).pipe(tslint.report());
    });

    /**
     * deletes everything in the output path
     */
    gulp.task(`${prefix}clean`, function () {
      return del.sync([`${_config.outputPath}/*.js`]);
    });
    gulp.task(`${prefix}clean:dist`, function () {
      return del.sync([`${_config.deployPath}/*.js`]);
    });
  }

}

module.exports = GulpConfig;
