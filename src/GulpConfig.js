const fs = require('fs');
const del = require('del');
const babel = require('gulp-babel');
const print = require('gulp-print');
const eslint = require('gulp-eslint');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const excludeGitignore = require('gulp-exclude-gitignore');
const plumber = require('gulp-plumber');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const isparta = require('isparta');
const path = require('path');
const appRoot = require('app-root-path');
const coveralls = require('gulp-coveralls');
const gutil = require('gulp-util');
//const webpack = require('gulp-webpack');
//const webpack = require('webpack-stream');
const webpack = require('webpack');
const tsProject = ts.createProject(path.join(__dirname, '../tsconfig.json'));
const nsp = require('gulp-nsp');
//const eslintConfig = require('./.eslintrc');
//const install = require('gulp-install');
//const colors = require('colors');
//const Cache = require('gulp-file-cache');
//const inject = require('gulp-inject');

class GulpConfig {
  constructor(gulp) {
    this.gulp = gulp;
    this.eslintConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.eslintrc')));
    this.babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc')));
    this.webpackProdConfig = require('../webpack.config.prod')({}); //TODO: enable dynamic configs

    this.tslintConfig = require('../tslint');

    this.babel = this.babel.bind(this);
    this.config = this.config.bind(this);
    this.tslint = this.tslint.bind(this);


    this.init = this.init.bind(this);
    this.initTs = this.initTs.bind(this);
    this.initJs = this.initJs.bind(this);
    this.initTest = this.initTest.bind(this);
    this.initClean = this.initClean.bind(this);

    this.initialize = this.initialize.bind(this);


    this.config = {
      prefix: 'gulpconfig:',
      allJs: 'src/**/*.js',
      allTs: 'src/**/*.ts',
      allOther: 'src/**/!(*.js|*.ts|*.map|*.src)',
      libraryTypeScriptDefinitions: 'typings/**/*.d.ts',
      outputPath: 'lib',
      deployPath: 'dist',
      typings: './typings/',
      defs: 'release/definitions',
      clientMain: '/client/index',
      serverMain: '/server/app.js',
      serverWatch: '/server/**.*'
    };
    const {
      prefix
    } = this.config;

    this.tasks = {
      clean: `${prefix}clean`, //clear out the lib filter
      cleanDist: `${prefix}clean:dist`, //clear out the dist folder

      //typescript
      tsLint: `${prefix}ts-lint`, //lint typescript
      tsCompile: `${prefix}ts-compile`, //compile typescript
      tsTask: `${prefix}ts`, //do both

      //javascript
      jsTask: `${prefix}js`, //lint and compile javascript

      allCompile: `${prefix}compile`, //lint and compile javascript and typecsript
      otherTask: `${prefix}other`, //move all non-ts and js files to lib,
      watchAll: `${prefix}watch`,

      buildLib: `${prefix}build`, //build dev
      buildDist: `${prefix}build:dist` //build for production
    };

    this.config.appRoot = appRoot.path;
  }



  config(config) {
    this.config = Object.assign({}, this.config, config);
  }

  /**
   * change tslint config
   */
  tslint(config) {
    this.tslintConfig = config;
  }

  /**
   * change babel config
   */
  babel(config) {
    this.babelConfig = config;
  }

  /**
   * change eslint config
   */
  eslint(config) {
    this.eslintConfig = config;
  }

  /**
   * shorthand syntax for initialize
   */
  init() {
    this.initialize();
  }

  /** 
   * typescript tasks
   */
  initTs() {
    const {
      config,
      gulp,
      tasks,
      tslintConfig
    } = this;

    /**
     * Lint all custom TypeScript files.
     */
    gulp.task(tasks.tsLint, function() {
      return gulp.src(config.allTs)
        .pipe(tslint({
          formatter: 'verbose',
          configuration: tslintConfig
        })).pipe(tslint.report());
    });

    /**
     * Compile TypeScript and include references to library and app .d.ts files.
     */
    gulp.task(tasks.tsCompile, function() {

      const sourceTsFiles = [
        config.allTs, //path to typescript files
        //config.libraryTypeScriptDefinitions  //reference to library .d.ts files
      ];

      const tsResult = gulp.src(sourceTsFiles)
        .pipe(excludeGitignore())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

      tsResult.dts.pipe(gulp.dest(config.outputPath));

      return tsResult.js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.outputPath));

    });

    /**
     * do both
     */
    gulp.task(tasks.tsTask, [tasks.tsLint, tasks.tsCompile]);
  }

  initJs() {
    const {
      babelConfig,
      config,
      gulp,
      tasks,
      eslintConfig
    } = this;

    /** resolve babel configs relative to this file instead of root */
    babelConfig.presets = babelConfig.presets.map(x => `babel-preset-${x}`).map(require.resolve);
    babelConfig.plugins = babelConfig.plugins.map(x => `babel-plugin-${x}`).map(require.resolve);

    /**
     * Compile javascript through babel.
     */
    gulp.task(tasks.jsTask, function() {
      return gulp.src(config.allJs)
        .pipe(excludeGitignore())
        //.pipe(print())
        .pipe(eslint(eslintConfig))
        .pipe(eslint.format())
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(config.outputPath));
    });
  }

  initTest() {
    const {
      config,
      gulp
    } = this;
    /**
     * testing
     */
    gulp.task('pre-test', function() {
      return gulp.src([
          `${config.outputPath}/**/*.js`,
          `!${config.outputPath}/**/*.test.js`,
        ])
        .pipe(excludeGitignore())
        .pipe(istanbul({
          includeUntested: true,
          instrumenter: isparta.Instrumenter
        }))
        .pipe(istanbul.hookRequire());
    });

    gulp.task('test', ['pre-test'], function(cb) {
      var mochaErr;

      gulp.src(`${config.outputPath}/**/*.test.js`)
        .pipe(plumber())
        .pipe(mocha({
          reporter: 'spec'
        }))
        .on('error', function(err) {
          mochaErr = err;
        })
        .pipe(istanbul.writeReports())
        .on('end', function() {
          cb(mochaErr);
        });
    });

    gulp.task('coveralls', ['test'], function() {
      if (!process.env.CI) {
        return;
      }
      return gulp.src(path.join(config.appRoot, 'coverage/lcov.info'))
        .pipe(coveralls());
    });
  }

  initClean() {
    const {
      config,
      gulp,
      tasks
    } = this;
    /**
     * deletes everything in the output path
     */
    gulp.task(tasks.clean, function() {
      return del.sync([`${config.outputPath}/**`]);
    });
    gulp.task(tasks.cleanDist, function() {
      return del.sync([`${config.deployPath}/**`]);
    });

    gulp.task('clean', [tasks.clean, tasks.cleanDist]);
  }

  initialize() {
    const {
      config,
      babelConfig,
      gulp,
      tasks,
      webpackProdConfig
    } = this;

    this.initTs();
    this.initJs();
    this.initTest();
    this.initClean();

    /** 
     * security
     */
    gulp.task('nsp', function(cb) {
      nsp({
        package: path.join(config.appRoot, 'package.json')
      }, cb);
    });

    /**
     * deployment
     */
    gulp.task(tasks.buildDist, [tasks.cleanDist, tasks.buildLib], function() {

      //move non-script assets
      gulp.src(`${config.outputPath}/**/*!(*.js|*.ts|*.map|*.src|*.css|*.ejs)`)
        .pipe(gulp.dest(config.deployPath));

      // run webpack
      webpack(webpackProdConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
          // output options
        }));
        //cb();
      });

      //compile server
      return gulp.src(`${config.outputPath}/server/**/*.js`)
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(`${config.deployPath}/server`));
    });


    /**
     * WARN: these is are defaults. if you want to have your own stuff, overwrite this.
     */
    gulp.task('prepublish', ['nsp', tasks.buildDist]);
    gulp.task('default', [tasks.allCompile, 'test', 'coveralls']);

    /**
     * watch task
     */
    //TODO: watch only client code.
    gulp.task(tasks.watchAll, function() {
      gulp.watch(config.allJs, [tasks.allJs]);
      gulp.watch(config.allTs, [tasks.allTs]);
      gulp.watch(config.allOther, [tasks.allOther]);
    });


    gulp.task(tasks.otherTask, function() {
      return gulp.src(config.allOther)
        .pipe(excludeGitignore())
        //.pipe(print())
        .pipe(gulp.dest(config.outputPath));
    });


    /**
     * compile all src code into lib
     */
    gulp.task(tasks.allCompile, [tasks.tsTask, tasks.jsTask, tasks.otherTask]);

    /**
     * clean and then compile into lib
     */
    gulp.task(tasks.buildLib, [tasks.clean, tasks.allCompile]);

    //TODO: watch only server code.
    gulp.task('dev', [tasks.clean, tasks.allCompile], () => { // 'start'
      nodemon({
        script: `${config.outputPath}${config.serverMain}`, // run ES5 code 
        watch: 'src/server/**/*', // watch ES2015 code 
        tasks: [tasks.allCompile] // compile synchronously onChange 
      });
    });

  }
}

module.exports = GulpConfig;