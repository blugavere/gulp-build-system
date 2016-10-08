'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var fs = require('fs');
var del = require('del');
var babel = require('gulp-babel');
var print = require('gulp-print');
var eslint = require('gulp-eslint');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');
var excludeGitignore = require('gulp-exclude-gitignore');
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var isparta = require('isparta');
var path = require('path');
var appRoot = require('app-root-path');
var coveralls = require('gulp-coveralls');

var tsProject = ts.createProject(path.join(__dirname, '../tsconfig.json'));
var nsp = require('gulp-nsp');
//const eslintConfig = require('./.eslintrc');
//const install = require('gulp-install');
//const colors = require('colors');
//const Cache = require('gulp-file-cache');
//const inject = require('gulp-inject');

var GulpConfig = function () {
  function GulpConfig(gulp) {
    _classCallCheck(this, GulpConfig);

    this.gulp = gulp;
    this.babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc')));
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

  _createClass(GulpConfig, [{
    key: 'babel',
    value: function babel(config) {
      this.babelConfig = config;
    }
  }, {
    key: 'config',
    value: function config(_config2) {
      this._config = _extends({}, this._config, _config2);
    }
  }, {
    key: 'tslint',
    value: function tslint(config) {
      this.tslintConfig = config;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      //const self = this;
      var _config = this._config;
      var prefix = this._config.prefix;
      var babelConfig = this.babelConfig;
      var gulp = this.gulp;
      var tslintConfig = this.tslintConfig;

      /**
       * testing
       */

      gulp.task('pre-test', function () {
        return gulp.src([_config.outputPath + '/**/*.js', '!' + _config.outputPath + '/**/*.test.js']).pipe(excludeGitignore()).pipe(istanbul({
          includeUntested: true,
          instrumenter: isparta.Instrumenter
        })).pipe(istanbul.hookRequire());
      });

      gulp.task('test', ['pre-test'], function (cb) {
        var mochaErr;

        gulp.src(_config.outputPath + '/**/*.test.js').pipe(plumber()).pipe(mocha({ reporter: 'spec' })).on('error', function (err) {
          mochaErr = err;
        }).pipe(istanbul.writeReports()).on('end', function () {
          cb(mochaErr);
        });
      });

      /** 
       * security
       */
      gulp.task('nsp', function (cb) {
        nsp({ package: path.join(_config.appRoot, 'package.json') }, cb);
      });

      /**
       * deployment
       */
      var buildDist = prefix + 'build:dist';
      gulp.task(buildDist, [prefix + 'clean:dist', prefix + 'build'], function () {
        return gulp.src(_config.outputPath + '/**/*.js').pipe(babel()).pipe(gulp.dest(_config.deployPath));
      });

      gulp.task('coveralls', ['test'], function () {
        if (!process.env.CI) {
          return;
        }
        return gulp.src(path.join(_config.appRoot, 'coverage/lcov.info')).pipe(coveralls());
      });

      /**
       * WARN: these is are defaults. if you want to have your own stuff, overwrite this.
       */
      gulp.task('prepublish', ['nsp', buildDist]);
      gulp.task('default', [prefix + 'compile', 'test', 'coveralls']);

      /**
       * watch task
       */
      //TODO: watch only client code.
      gulp.task(prefix + 'watch', function () {
        gulp.watch(_config.allJs, [prefix + 'js']);
        gulp.watch(_config.allTs, [prefix + 'ts']);
      });

      /**
       * Compile TypeScript and include references to library and app .d.ts files.
       */
      gulp.task(prefix + 'ts-compile', function () {

        var sourceTsFiles = [_config.allTs];

        var tsResult = gulp.src(sourceTsFiles).pipe(excludeGitignore()).pipe(sourcemaps.init()).pipe(ts(tsProject));

        tsResult.dts.pipe(gulp.dest(_config.outputPath));

        return tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest(_config.outputPath));
      });

      /**
       * Compile javascript through babel.
       */
      var jsTask = prefix + 'js';
      gulp.task(jsTask, function () {
        return gulp.src(_config.allJs).pipe(excludeGitignore()).pipe(print()).pipe(eslint()).pipe(eslint.format()).pipe(babel(babelConfig)).pipe(gulp.dest(_config.outputPath));
      });

      var tsTask = prefix + 'ts';
      gulp.task(tsTask, [prefix + 'ts-lint', prefix + 'ts-compile']);
      var compileTask = prefix + 'compile';
      gulp.task(compileTask, [tsTask, jsTask]);
      gulp.task(prefix + 'build', [prefix + 'clean', tsTask, jsTask]);

      //TODO: watch only server code.
      gulp.task('dev', [prefix + 'clean', compileTask], function () {
        // 'start'
        nodemon({
          script: '' + _config.outputPath + _config.serverMain, // run ES5 code 
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
      gulp.task(prefix + 'ts-lint', function () {
        return gulp.src(_config.allTs).pipe(tslint({
          formatter: 'verbose',
          configuration: tslintConfig
        })).pipe(tslint.report());
      });

      /**
       * deletes everything in the output path
       */
      gulp.task(prefix + 'clean', function () {
        return del.sync([_config.outputPath + '/*.js']);
      });
      gulp.task(prefix + 'clean:dist', function () {
        return del.sync([_config.deployPath + '/*.js']);
      });
    }
  }]);

  return GulpConfig;
}();

module.exports = GulpConfig;