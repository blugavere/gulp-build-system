const fs = require('fs');
const del = require('del');
const babel = require('gulp-babel');
//const print = require('gulp-print');
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
const appRoot = require('app-root-dir'); //require('app-root-path');
const coveralls = require('gulp-coveralls');
const gutil = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const tsProject = ts.createProject(path.join(__dirname, '../tsconfig.json'));
const nsp = require('gulp-nsp');
const build = require('./tools/build');
//const eslintConfig = require('./.eslintrc');
//const install = require('gulp-install');
//const colors = require('colors');
//const Cache = require('gulp-file-cache');
//const inject = require('gulp-inject');
const webpackDev = require('../webpack/webpack.config.dev');
const webpackProd = require('../webpack/webpack.config.prod');

class GulpConfig {
  constructor(gulp) {
    this.gulp = gulp;
    this.eslintConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.eslintrc')));
    this.babelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc')));

    this.tslintConfig = require('../tslint');

    this.babel = this.babel.bind(this);
    this.setConfig = this.setConfig.bind(this);

    this.defineTasks = this.defineTasks.bind(this);
    this.definePaths = this.definePaths.bind(this);

    this.tslint = this.tslint.bind(this);


    this.init = this.init.bind(this);
    this.initTs = this.initTs.bind(this);
    this.initJs = this.initJs.bind(this);
    this.initTest = this.initTest.bind(this);
    this.initClean = this.initClean.bind(this);

    this.initialize = this.initialize.bind(this);


    this.config = {
      //prefix: '',
      allJs: 'src/**/*.js',
      allTs: 'src/**/*.ts',
      allOther: 'src/**/!(*.js|*.ts|*.map|*.src)',
      libraryTypeScriptDefinitions: 'typings/**/*.d.ts',

      sourceRoot: 'src',
      buildRoot: 'lib',
      deployRoot: 'dist',

      typings: './typings/',
      defs: 'release/definitions',
      clientMain: '/client/index.js'
    };

  }

  definePaths() {
    const {
      config,
      config: {
        appRoot,
        buildRoot,
        sourceRoot
      }
    } = this;
    const clientEntry = config.clientEntry || path.join(appRoot, `./${sourceRoot}${config.clientMain}`);
    this.config = Object.assign({}, this.config, {
      clientEntry,
      clientWatch: path.dirname(clientEntry),
      serverEntry: config.serverEntry || `${buildRoot}/server/app.js`,
      serverWatch: config.serverWatch || `${sourceRoot}/server/**`
    });
  }

  defineTasks(prefix) {
    prefix = prefix || this.config.prefix;

    this.tasks = {
      clean: 'clean', //clear out the lib filter
      cleanBuild: 'clean:build',
      cleanDist: 'clean:dist', //clear out the dist folder

      //typescript
      tsLint: 'ts-lint', //lint typescript
      tsCompile: 'ts-compile', //compile typescript
      tsTask: 'ts', // do both

      /** javascript process */
      jsTask: 'js', // lint and compile javascript

      allCompile: 'compile', // lint and compile javascript and typecsript
      otherTask: 'other', // move all non-ts and js files to lib,
      watchAll: 'watch',

      buildLib: 'build:lib', // build dev
      buildDist: 'build:dist', // build for production

      startServer: 'dev:server', // start nodemon process
      startClient: 'dev:client',
      start: 'dev' // start client & server 
    };

    if (prefix) {
      for (let i in this.tasks) {
        this.tasks[i] = `${prefix}${this.tasks[i]}`;
      }
    }

    this.config.appRoot = appRoot.get(); //appRoot.path;
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
    gulp.task(tasks.tsLint, function () {
      return gulp.src(config.allTs)
        .pipe(tslint({
          formatter: 'verbose',
          configuration: tslintConfig
        })).pipe(tslint.report());
    });

    /**
     * Compile TypeScript and include references to library and app .d.ts files.
     */
    gulp.task(tasks.tsCompile, function () {

      const sourceTsFiles = [
        config.allTs, //path to typescript files
        //config.libraryTypeScriptDefinitions  //reference to library .d.ts files
      ];

      const tsResult = gulp.src(sourceTsFiles)
        .pipe(excludeGitignore())
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

      tsResult.dts.pipe(gulp.dest(config.buildRoot));

      return tsResult.js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.buildRoot));

    });

    /**
     * do both
     */
    gulp.task(tasks.tsTask, gulp.series([tasks.tsLint, tasks.tsCompile]));
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
    gulp.task(tasks.jsTask, () => {
      return gulp.src(config.allJs)
        .pipe(excludeGitignore())
        //.pipe(print())
        .pipe(eslint(eslintConfig))
        .pipe(eslint.format())
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(config.buildRoot));
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
    gulp.task('pre-test', () => {
      return gulp.src([
          `${config.buildRoot}/**/*.js`,
          `!${config.buildRoot}/**/*.test.js`,
        ])
        .pipe(excludeGitignore())
        .pipe(istanbul({
          includeUntested: true,
          instrumenter: isparta.Instrumenter
        }))
        .pipe(istanbul.hookRequire());
    });

    gulp.task('test', gulp.series('pre-test', (cb) => {
      let mochaErr;

      gulp.src(`${config.buildRoot}/**/*.test.js`)
        .pipe(plumber())
        .pipe(mocha({
          reporter: 'spec'
        }))
        .on('error', err => {
          mochaErr = err;
        })
        .pipe(istanbul.writeReports())
        .on('end', () => {
          cb(mochaErr);
        });
    }));

    gulp.task('coveralls', gulp.series('test', () => {
      if (!process.env.CI) {
        return;
      }
      return gulp.src(path.join(config.appRoot, 'coverage/lcov.info'))
        .pipe(coveralls());
    }));
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
    gulp.task(tasks.cleanBuild, () => {
      return del([`${config.buildRoot}/**`]);
    });

    gulp.task(tasks.cleanDist, () => {
      return del([`${config.deployRoot}/**`]);
    });

    gulp.task(tasks.clean, gulp.parallel(tasks.cleanBuild, tasks.cleanDist));
  }

  initialize() {
    /** set tasks names */
    this.defineTasks();
    this.definePaths();

    const {
      config,
      //babelConfig,
      gulp,
      tasks,
    } = this;

    const webpackDevConfig = webpackDev(config);
    const webpackProdConfig = webpackProd(config);

    this.initTs();
    this.initJs();
    this.initTest();
    this.initClean();



    /**
     * watch task
     */
    //TODO: watch only client code.
    gulp.task(tasks.watchAll, () => {
      gulp.watch(config.allJs, [tasks.allJs]);
      gulp.watch(config.allTs, [tasks.allTs]);
      gulp.watch(config.allOther, [tasks.allOther]);
    });


    gulp.task(tasks.otherTask, () => {
      return gulp.src(config.allOther)
        .pipe(excludeGitignore())
        //.pipe(print())
        .pipe(gulp.dest(config.buildRoot));
    });


    /**
     * compile all src code into lib
     */
    gulp.task(tasks.allCompile, gulp.parallel([tasks.tsTask, tasks.jsTask, tasks.otherTask]));

    /**
     * clean and then compile into lib
     */
    gulp.task(tasks.buildLib, gulp.series([tasks.clean, tasks.allCompile]));

    /** 
     * clean all, compile, run, and watch server
     */
    gulp.task(tasks.startServer, gulp.series(tasks.clean, tasks.allCompile, () => { // 'start'
      nodemon({
        script: config.serverEntry, // run ES5 code 
        watch: config.serverWatch, // watch server code 
        tasks: [tasks.allCompile] // compile synchronously onChange 
      });
    }));

    /** Start a webpack-dev-server, with hotreloading */
    gulp.task(tasks.startClient, () => {
      webpackDevConfig.entry.app.unshift(
        'webpack-dev-server/client?http://localhost:8080/',
        'webpack/hot/dev-server',
        config.clientEntry
      );
      const compiler = webpack(webpackDevConfig);

      new WebpackDevServer(compiler, {
        hot: true
      }).listen(8080, 'localhost', (err) => {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
      });
    });

    gulp.task(tasks.start, gulp.parallel(tasks.startServer, tasks.startClient));

    /** 
     * security
     */
    gulp.task('nsp', cb => {
      nsp({
        package: path.join(config.appRoot, 'package.json')
      }, cb);
    });

    /**
     * deployment
     */
    gulp.task(tasks.buildDist, gulp.series(tasks.cleanDist, tasks.buildLib, () => {


      // run webpack
      /*
      webpack(webpackProdConfig, function (err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
          // output options
        }));
      });
      */
      webpackProdConfig.entry.app.unshift(
        config.clientEntry
      );

      build(webpackProdConfig);
      //move non-script assets
      return gulp.src(`${config.buildRoot}/**/*!(*.js|*.jsx|*.ts|*.map|*.html|*.src|*.css|*.ejs)`)
        .pipe(gulp.dest(config.deployRoot));

      //compile server

      //return gulp.src(`${config.buildRoot}/server/**/*.js`)
      //.pipe(babel(babelConfig))
      //.pipe(gulp.dest(`${config.deployRoot}/server`));

    }));
    /**
     * WARN: these is are defaults. if you want to have your own stuff, overwrite this.
     */
    gulp.task('prepublish', gulp.series(['nsp', tasks.buildDist]));
    gulp.task('default', gulp.series([tasks.allCompile, 'test', 'coveralls']));

    //console.log('Gulp tasks registered successfully!'.bold.green);
  }

  setConfig(config) {
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

}

module.exports = GulpConfig;