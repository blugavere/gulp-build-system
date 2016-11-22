
const fs = require('fs');
const del = require('del');
const babel = require('gulp-babel');
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
const appRoot = require('app-root-dir');
const coveralls = require('gulp-coveralls');
const gutil = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const nsp = require('gulp-nsp');

const tsProject = ts.createProject(path.join(__dirname, '../tsconfig.json'));
const build = require('./tools/build');
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

    /** things you can edit */
    this.config = {
      appRoot: appRoot.get(), // not this
      libraryTypeScriptDefinitions: 'typings/**/*.d.ts', // nor this
      typings: './typings/', // nor either of these two
      defs: 'release/definitions',

      sourceRoot: 'src',
      buildRoot: 'lib',
      deployRoot: 'dist',

      clientEntry: 'src/client/index.js',
      serverEntry: 'src/server/app.js',
      nspEnabled: true
    };
  }
  /**
   * things that you should not edit - these get generated based on the constructor configs.
   */
  definePaths() {
    const {
      config,
      config: {
        appRoot,
        buildRoot,
        sourceRoot
      }
    } = this;

    /** client is built using webpack, so watch the source code */
    const clientEntry = path.join(appRoot, `${config.clientEntry}`);

    /** server is built using gulp, so run the output directory but watch the source */
    const serverEntry = path.join(appRoot, config.serverEntry.replace(`/${sourceRoot}/`,`/${buildRoot}/`));
    const serverWatch = path.join(appRoot, `.${path.dirname(config.serverEntry)}`);
    const testRoot = path.join(config.appRoot, `${config.buildRoot}/**/*`);
    const clientBase = path.basename(path.dirname(this.config.clientEntry));
    this.config = Object.assign({}, this.config, {
      allJs: `${sourceRoot}/**/*.js`,
      allTs: `${sourceRoot}/**/*.ts`,
      allOther: `${sourceRoot}/**/!(*.js|*.ts|*.map|*.src)`,
      clientEntry,
      clientWatch: path.dirname(clientEntry),
      serverEntry,
      serverWatch,
      testRoot,
      testGlob: `${testRoot}.test.js`,
      clientDistDir: `${config.deployRoot}/${clientBase}`
    });
  }

  defineTasks(prefix) {
    prefix = prefix || this.config.prefix;

    this.tasks = {
      clean: 'clean', //clear out the lib filter
      cleanBuild: 'clean:build',
      cleanDist: 'clean:dist', //clear out the dist folder
      coveralls: 'coveralls',
      
      /** typescript */
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

      prepublish: 'prepublish',

      startServer: 'dev:server', // start nodemon process
      startClient: 'dev:client',
      start: 'dev', // start client & server 
      nsp:  'nsp',
      preTest: 'pre-test',
      test: 'test',
      testWatch: 'test:watch'
    };

    if (prefix) {
      for (let i in this.tasks) {
        this.tasks[i] = `${prefix}${this.tasks[i]}`;
      }
    }

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
        .pipe(eslint(eslintConfig))
        .pipe(eslint.format())
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(config.buildRoot));
    });
  }

  initTest() {
    const {
      config,
      config: {
        testRoot,
        testGlob
      },
      tasks,
      gulp
    } = this;

    /**
     * testing
     */
    gulp.task(tasks.preTest, () => {
      return gulp.src([
          `${testRoot}.js`,
          `!${testGlob}`,
        ])
        //.pipe(excludeGitignore())
        .pipe(istanbul({
          includeUntested: true,
          instrumenter: isparta.Instrumenter
        }))
        .pipe(istanbul.hookRequire());
    });

    gulp.task(tasks.test, gulp.series(tasks.tsTask, tasks.jsTask, tasks.preTest, (cb) => {
      let mochaErr;

      gulp.src(config.testGlob)
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
    
    gulp.task(tasks.testWatch, gulp.series(tasks.test, function watch() {
      return gulp.watch([
        path.join(config.appRoot, `${config.sourceRoot}/**/*.test.js`)
      ], gulp.series(tasks.test));
    }));

    gulp.task(tasks.coveralls, gulp.series(tasks.test, () => {
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
      return del([
        `${config.buildRoot}/**`,
        'coverage/**'
      ]);
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
      babelConfig,
      gulp,
      tasks,
    } = this;

    const webpackDevConfig = webpackDev(config, babelConfig);
    const webpackProdConfig = webpackProd(config, babelConfig);

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
    gulp.task(tasks.nsp, cb => {
      nsp({
        package: path.join(config.appRoot, 'package.json')
      }, cb);
    });

    /**
     * deployment
     */
    gulp.task(tasks.buildDist, gulp.series(tasks.cleanDist, tasks.buildLib, () => {
      // deprecated
      /*
      webpackProdConfig.entry.app.unshift(
        clientEntry
      );
      */
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
    const prepub = [tasks.buildDist];

    if(config.nspEnabled) {
      prepub.unshift(tasks.nsp);
    }

    gulp.task(tasks.prepublish, gulp.series(prepub));
    gulp.task('default', gulp.series([tasks.allCompile, tasks.test, tasks.coveralls]));
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