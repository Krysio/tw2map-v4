// Gulp

const path = require('path');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const browserSync = require('browser-sync');
const webpack = require('webpack');

/******************************/

// ENV

const ENV = process.env.NODE_ENV || 'development';
const VALID_ENV_LIST = ['development', 'production'];

if (VALID_ENV_LIST.indexOf(ENV) === -1) {
    throw new Error('Invalid ENV '+ ENV +' use '+ JSON.stringify(VALID_ENV_LIST));
}

const DIR_BUILD = '.';

/******************************/

// GLSL

function taskGl() {
    return gulp.src('src/glsl/*.glsl')
        .pipe(gulp.dest('static/common/glsl'));
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
    mode: ENV,
    entry: './src/js/main.ts',
    output: {
        path: path.resolve(__dirname, DIR_BUILD, 'static/'+ ENV +'/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            // { // Reakt
            //     test: /\.jsx$/,
            //     exclude: excludeNoSec,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: [/*'@babel/preset-env', */'@babel/preset-react']
            //         }
            //     }
            // },
            { // TypeScript + React
                test: /\.(ts|tsx)$/,
                exclude: excludeNoSec,
                use: [
                    {
                        loader: 'ts-loader'
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
            let pluginError = new gulpUtil.PluginError('webpack', error);

            gulpUtil.log('[webpack]', pluginError);
        }

        if (stats.compilation.errors.length) {
            let list = stats.compilation.errors;

            for (let i = 0, l = list.length; i < l; i++) {
                let pluginError = new gulpUtil.PluginError('webpack', list[ i ]);

                gulpUtil.log('[webpack][compilation]', pluginError);
            }
        }

        if (done) {
            done();
        }
    });
}

// html

function taskHtml() {
    return gulp.src('src/html/*.html')
        .pipe(gulp.dest('static/'+ ENV));
}

// watch

function taskWatch(done) {
    gulp.watch('src/glsl/*', taskGl);
    gulp.watch('src/html/*', taskHtml);
    gulp.watch('src/js/**/*', taskJs);
    done();
}

// default

let mainTask = gulp.series(
    // gulp.parallel(taskSass, taskHtml, taskCopyAssets)
    gulp.parallel(taskHtml, taskJs, taskGl)
);

// develop

let developTask = gulp.series(
    mainTask,
    taskWatch,
    function syncBrowser() {
        let bs = browserSync.create();

        bs.init({
            server: {
                baseDir: `./static/${ ENV }`,
                index: 'index.html'
            },
            serveStatic: [
                `./static/${ ENV }`,
                `./static/common`
            ]
        });

        gulp.watch(`static/${ ENV }/*`).on('change', bs.reload);
        gulp.watch(`static/${ ENV }/js/*`).on('change', bs.reload);
        gulp.watch(`static/common/glsl/*`).on('change', bs.reload);
        gulp.watch(`static/common/js/*`).on('change', bs.reload);
    }
);

Object.assign(exports, {
    default: mainTask,
    html: taskHtml,
    js: taskJs,
    watch: taskWatch,
    develop: developTask
});
