//@ts-check

// Gulp

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const webpack = require('webpack');
const historyFallback = require('connect-history-api-fallback');
//@ts-ignore
const chalk = require('chalk');

/******************************/

let fileConfig;
let fileConfigRaw = fs.readFileSync(path.join(
    __dirname,
    'config.json'
), {encoding: 'utf8'});
try {
    fileConfig = JSON.parse(fileConfigRaw);
} catch (error) {}

const config = {
    ...{
        NODE_ENV: 'production',
        PORT: 1313,
        DIR_DATA: null
    },
    ...(fileConfig || {})
};

// ENV

const ENV = process.env.NODE_ENV || 'development';
const VALID_ENV_LIST = ['development', 'production'];

if (VALID_ENV_LIST.indexOf(ENV) === -1) {
    throw new Error('Invalid ENV '+ ENV +' use '+ JSON.stringify(VALID_ENV_LIST));
}

const DIR_BUILD = './dest';

/******************************/

// html

function taskHtml() {
    return gulp.src(`src/html/${ ENV }/*.html`)
        .pipe(gulp.dest(
            path.join(DIR_BUILD, 'static', ENV)
        ));
}

// GLSL

function taskGl() {
    return gulp.src('src/glsl/*.glsl')
        .pipe(gulp.dest(
            path.join(DIR_BUILD, 'static/common/glsl')
        ));
}

// SASS

function taskSass() {
    return gulp.src('src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(
            path.join(DIR_BUILD, 'static', ENV, 'css')
        ));
}

// JS

/**
 * // exclude - wszystko poza ./src
 * @param {string} testPath
 */
function excludeNoSec(testPath) {
    let normalized = path.normalize(testPath);
    let relative = normalized.replace(
        path.normalize(__dirname),
        ''
    );
    let splited = relative.split(path.sep);

    if (splited[1] === 'src') {
        return false;
    }

    return true;
}

let compiler = webpack({
    mode: ENV === 'production' ? 'production' : 'development',
    devtool: ENV === 'production' ? false : 'eval-source-map',
    entry: './src/js/main.ts',
    output: {
        path: path.resolve(__dirname, DIR_BUILD, 'static/'+ ENV +'/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { // Reakt
                test: /\.jsx$/,
                exclude: excludeNoSec,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [/*'@babel/preset-env', */'@babel/preset-react'],
                        allowTsInNodeModules: true
                    }
                }
            },
            { // TypeScript + React
                test: /\.(ts|tsx)$/,
                exclude: excludeNoSec,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            allowTsInNodeModules: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }
});

function taskJs(done) {
    compiler.run((error, stats) => {
        if (error) {
            console.log(
                chalk['yellow']('[webpack][main]')
            );
            console.error(error.message);
        }

        if (stats.compilation.errors.length) {
            let list = stats.compilation.errors;

            for (let i = 0, l = list.length; i < l; i++) {
                let error = list[ i ];

                console.log(chalk['yellow']('[webpack][compilation]'));
                console.error(error.message);
            }
        }

        if (done) {
            done();
        }
    });
}

// watch

function taskWatch(done) {
    gulp.watch('src/glsl/*', taskGl);
    gulp.watch('src/html/*', taskHtml);
    gulp.watch('src/sass/**/*', taskSass);
    gulp.watch('src/js/**/*', taskJs);
    done();
}

// default

let mainTask = gulp.series(
    gulp.parallel(taskSass, taskHtml, taskJs, taskGl)
);

// develop

let developTask = gulp.series(
    mainTask,
    taskWatch,
    function syncBrowser() {
        let bs = browserSync.create();

        bs.init({
            server: {
                baseDir: `${ DIR_BUILD }/static/${ ENV }`,
                index: 'index.html',
                middleware: [
                  historyFallback()
                ]
            },
            //@ts-ignore
            serveStatic: [
                `${ DIR_BUILD }/static/${ ENV }`,
                `${ DIR_BUILD }/static/common`,
                {
                    route: '/data',
                    dir: config['DIR_DATA']
                }
            ]
        });

        gulp.watch(`${ DIR_BUILD }/static/${ ENV }/*`).on('change', bs.reload);
        gulp.watch(`${ DIR_BUILD }/static/${ ENV }/js/*`).on('change', bs.reload);
        gulp.watch(`${ DIR_BUILD }/static/${ ENV }/css/*`).on('change', bs.reload);
        gulp.watch(`${ DIR_BUILD }/static/common/glsl/*`).on('change', bs.reload);
        gulp.watch(`${ DIR_BUILD }/static/common/js/*`).on('change', bs.reload);
    }
);

Object.assign(exports, {
    default: mainTask,
    html: taskHtml,
    sass: taskSass,
    js: taskJs,
    watch: taskWatch,
    develop: developTask
});
