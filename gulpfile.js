const { src, dest, watch, parallel, series } = require('gulp');

const browserSync = require('browser-sync').create();
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

// ---- Сервер ----
function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',                    // ← отдаём папку app
    },
    browser: 'C:\\Program Files\\Yandex\\YandexBrowser\\Application\\browser.exe',
    notify: false,
    open: true,                            // открыть браузер сразу
  });
}

// ---- Очистка dist ----
function cleanDist() {
  return del('dist');
}

// ---- Картинки ----
function images() {
  return src('app/images/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest('dist/images'));
}

// ---- Скрипты ----
function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'app/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// ---- Стили ----
function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      })
    )
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// ---- Сборка в dist ----
function build() {
  return src(
    [
      'app/css/style.min.css',
      'app/fonts/**/*',
      'app/js/main.min.js',
      'app/*.html',
    ],
    { base: 'app' }
  ).pipe(dest('dist'));
}

// ---- Наблюдение ----
function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

// ---- Экспорты ----
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

// default: компилируем всё → поднимаем сервер → следим за изменениями
exports.default = series(parallel(styles, scripts), parallel(browsersync, watching));