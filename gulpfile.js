/**
 *  Gulpfile
 */

'use strict';

var path = require('path');
var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');

var browserSync = require('browser-sync').create();

var Builder = require('systemjs-builder');

var errorHandler = require('./gulp/error-handler');
var tsd = require('./gulp/tsd')('./tsd.json');

var $ = require('gulp-load-plugins')();


var conf = {
    paths: {
        src: 'src',
        dist: 'dist',
        tmp: '.tmp'
    },
    tsconfig: {
        compilerOptions: {
            target: 'es5',
            module: 'system'
        }
    }
};


/**
 * Tsd
 */

gulp.task('tsd:install', function () {
    return tsd.install(path.join(__dirname, 'bower.json'));
});

gulp.task('tsd:purge', function () {
    return tsd.purge();
});

gulp.task('tsd', ['tsd:install']);


/**
 * Scripts
 */

gulp.task('scripts.ts', function () {
    var tsProject = $.typescript.createProject(conf.tsconfig.compilerOptions);

    return gulp.src(path.join(conf.paths.src, '/app/**/*.ts'))
        .pipe($.sourcemaps.init())
        .pipe($.typescript(tsProject)).on('error', errorHandler('TypeScript'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')))
        .pipe(browserSync.reload({stream: true}))
        .pipe($.size());
});

gulp.task('scripts.js', function () {
    return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
        .pipe(browserSync.reload({stream: true}))
        .pipe($.size());
});

gulp.task('scripts', function (done) {
    runSequence('tsd', ['scripts.js', 'scripts.ts'], done)
});

gulp.task('scripts:bundle', ['scripts'], function (done) {
    var builder = new Builder();
    var builderConfig = {
        map: {
            'app': path.join(conf.paths.tmp, '/serve/app')    
        },
        paths: {
            'lib/*': path.join(conf.paths.src, '/lib/*'),
            'common/*': path.join(conf.paths.src, '/common/*')
        },
        packages: {
            'app': {
                defaultExtension: 'js'
            }
        }
    };
    var expression = path.join(conf.paths.tmp, '/serve/app/**/*');
    var outputFile = path.join(conf.paths.tmp, '/bundles/app.js');

    builder.loadConfig(path.join(conf.paths.src, '/system-config.js'))
        .then(function () {
            builder.config(builderConfig);
            builder.buildSFX(expression, outputFile)
                .then(function () {
                    return done();
                })
                .catch(function (err) {
                    return done(err);
                });
        });
});


/**
 * Clean
 */

gulp.task('clean', function (done) {
    del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')], done);
});


/**
 * Watch
 */

gulp.task('watch', ['scripts'], function () {
    gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), ['scripts.js']);
    gulp.watch(path.join(conf.paths.src, '/app/**/*.ts'), ['scripts.ts']);
});


/**
 * Serve
 */

gulp.task('serve', ['watch'], function () {
    var server = {
        baseDir: [path.join(conf.paths.tmp, '/serve'), conf.paths.src]
    };

    browserSync.init({
        server: server
    });
});


/**
 * Build
 */

gulp.task('build', ['scripts:bundle'], function () {
    return gulp.src(path.join(conf.paths.tmp, '/bundles/app.js'))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});
