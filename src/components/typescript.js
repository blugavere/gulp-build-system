
'use strict';

const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const excludeGitignore = require('gulp-exclude-gitignore');
const path = require('path');
const tsProject = ts.createProject(path.join(__dirname, '../../tsconfig.json'));
const sourcemaps = require('gulp-sourcemaps');

/**
 * @param {object} gulp - gulpfile to inject
 * @param {object} config - configuration
 * @param {string} config.buildRoot - configuration
 * @param {string} config.allTs - configuration
 * @param {object} tasks - task name configuration
 * @param {string} config.tsCompile - configuration
 * @param {string} config.tsTask - configuration
 * @param {string} config.tslintConfig - configuration
 */
const typescript = (gulp, config, tasks, tslintConfig) => {

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

        const tsResult = gulp.src(config.allTs)
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
    gulp.task(tasks.tsTask, [tasks.tsLint, tasks.tsCompile], function(){});

};

module.exports = typescript;
