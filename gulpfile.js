
const gulp = require('gulp');
const glsl = require("gulp-glsl");
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');

gulp.task(function glslminify() {
	return gulp.src('**/!(*.min).glsl')
		.pipe(plumber())
		.pipe(glsl({format: 'raw'}))
		.pipe(rename({extname: '.min.glsl'}))
  	.pipe(gulp.dest('.'));
});
