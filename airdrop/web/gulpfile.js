var gulp        = require('gulp');
var runSequence = require('run-sequence');
var sass        = require('gulp-sass');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var concat      = require('gulp-concat');

var distCSSFolder = './css';
var distJSFolder = './js';

// SCSS tasks
gulp.task('build:sass', function () {
    return gulp.src('./css/src/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(distCSSFolder));
});

gulp.task('watch:sass', function () {
    return gulp.watch('./css/**/*.scss', ['build:sass']);
});

/* MAIN GULP TASKS */
gulp.task('default', function(cb) {
    runSequence('build:sass', cb);
});
gulp.task('watch', function(cb) {
    runSequence('build:sass', 'watch:sass', cb);
});
