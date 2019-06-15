
'use-strict'
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');

gulp.task('default', ['browser-sync'], function() {
  gulp.watch("./sass/*.scss", ['sass']);
  gulp.watch("css/*.css", browserSync.reload);
  gulp.watch("*.html", browserSync.reload);
  gulp.watch("js/*.js", browserSync.reload);
  gulp.watch("gulpfile.js", browserSync.reload);
})

gulp.task('browser-sync', function() {
  browserSync.init({
    server: "./",
    // https: true
  }, function(err, bs) {
        bs.addMiddleware("*", function(req, res) {
            // console.log(req)
            res.writeHead(302, {
                location: `not-found-page.html`,
            });
            res.body(req).send()
            // res.end("Redirecting!");
        })
      })
})

gulp.task('sass', function () {
  return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'))
})
