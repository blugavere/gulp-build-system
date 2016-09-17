/* eslint-disable */
const fs = require('fs');
const babelConfig = JSON.parse(fs.readFileSync('./.babelrc'));
require('babel-register')(babelConfig);
require('babel-polyfill');

const path = require('path');
const colors = require('colors');
const del = require('del');
const tslintConfig = require('./tslint');
//const eslintConfig = require('./.eslintrc');

const gulp = require('gulp');
const babel = require('gulp-babel');
const print = require('gulp-print');
const install = require('gulp-install');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const inject = require('gulp-inject');
const istanbul = require('gulp-istanbul');
const nodemon = require('gulp-nodemon');

const tsProject = ts.createProject('tsconfig.json');



const config = {
  allJs: 'src/**/*.js',
  allTypeScript: 'src/**/*.ts',
  libraryTypeScriptDefinitions: 'typings/**/*.d.ts',
  tsOutputPath: 'build',
  typings: './typings/',
  defs: 'release/definitions'
}

/**
 * watch task
 */
//TODO: watch only client code.
gulp.task('watch', function () {
  gulp.watch(config.allJs, ['js']);
  gulp.watch(config.allTypeScript, ['ts']);
});


/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('ts-compile', function () {

  const sourceTsFiles = [
    config.allTypeScript,   //path to typescript files
    //config.libraryTypeScriptDefinitions  //reference to library .d.ts files
  ];

  const tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject));
  /*.pipe(ts({
    module: "commonjs",
    noImplicitAny: true,
    sourceMap: true,
    allowJs: true,
    declaration: true,
    //noExternalResolve: true
    //outDir: 'build/'
  }));*/

  tsResult.dts.pipe(gulp.dest(config.tsOutputPath));

  return tsResult.js.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.tsOutputPath));

});

/**
 * Compile javascript through babel.
 */

gulp.task('js', function () {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel(babelConfig))
    .pipe(gulp.dest('build'));
});

gulp.task('ts', ['ts-lint', 'ts-compile']);
gulp.task('compile', ['ts', 'js']);
gulp.task('build', ['clean', 'ts', 'js']);
gulp.task('default', ['build', 'watch']);


//TODO: watch only server code.

gulp.task('dev', ['clean', 'compile'], function () {
  gulp.start('start');
});

gulp.task('start', function () {
  nodemon({
    script: 'build/app.js', // run ES5 code 
    watch: 'src/**.*', // watch ES2015 code 
    tasks: ['compile'] // compile synchronously onChange 
  });
});

/**
 * Completed
 */




/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
  return gulp.src(config.allTypeScript)
    .pipe(tslint({
      formatter: "verbose",
      configuration: tslintConfig
    })).pipe(tslint.report());
});

gulp.task('clean', function () {
  return del.sync(['build/**']);
});





/**
 * DEPRECATED
 */


/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
gulp.task('gen-ts-refs', function () {
  var target = gulp.src(config.allTypeScript);
  var sources = gulp.src([config.allTypeScript], { read: false });
  return target.pipe(inject(sources, {
    starttag: '//{',
    endtag: '//}',
    transform: function (filepath) {
      return '/// <reference path="../..' + filepath + '" />';
    }
  })).pipe(gulp.dest(config.tsOutputPath));
});
