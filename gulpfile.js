var gulp = require('gulp'),
    gutil = require('gulp-util');
    concat = require('gulp-concat'); 

gulp.task('default', function(){
	return gutil.log('Gulp is running!')
});

gulp.task('build', function(){
	return gulp.src(['AnimationClasses.js', 'mdl_animation2.js'])
		.pipe(concat('mdl_animation.js'))
		.pipe(gulp.dest('build'))
});
