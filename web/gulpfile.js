var 	gulp = require('gulp'),concat = require('gulp-concat');

var 	bower_path = 'bower_components';

gulp.task('theme:css', function()
{
	var paths = [
	  bower_path+'/bootstrap/dist/css/bootstrap.min.css',
		bower_path+'/AdminLTE/dist/css/AdminLTE.min.css',
    bower_path+'/AdminLTE/dist/css/skins/skin-blue.min.css',
    bower_path+'/Ionicons/css/ionicons.min.css',
    bower_path+'/font-awesome/css/font-awesome.min.css',
	];

	gulp.src(paths)
		.pipe(concat('theme.css'))
		.pipe(gulp.dest('assets/css'));
});
gulp.task('mapfile:css', function()
{
	var paths = [
	  bower_path+'/bootstrap/dist/css/bootstrap.min.css.map'
	];

	gulp.src(paths)
		.pipe(gulp.dest('assets/css'));
});
gulp.task('mapfile:js', function()
{
	var paths = [
	  bower_path + '/angular/angular.min.js.map'
	];

	gulp.src(paths)
		.pipe(gulp.dest('assets/js'));
});
gulp.task('theme:fonts', function()
{
	var paths = [
	  bower_path+'/Ionicons/fonts/*.*',
    bower_path+'/font-awesome/fonts/*.*'
	];

	gulp.src(paths)
		.pipe(gulp.dest('assets/fonts'));
});
gulp.task('core:js', function()
{
	var paths = [
    bower_path + '/jquery/dist/jquery.min.js',
    bower_path+'/bootstrap/dist/js/bootstrap.min.js',
    bower_path + '/AdminLTE/dist/js/app.min.js',
		bower_path + '/angular/angular.min.js',
		bower_path + '/angular-ui-router/release/angular-ui-router.min.js',
    'resources/app.js',
	];

	gulp.src(paths)
		.pipe(concat('core.js'))
		.pipe(gulp.dest('assets/js'));
});
gulp.task('pages:html', function()
{
	var paths = [
    'resources/pages/*.html'
	];

	gulp.src(paths)
			.pipe(gulp.dest('assets/pages'));
});



gulp.task('app:run', function()
{
	gulp.start('theme:css');
  gulp.start('theme:fonts');
  gulp.start('core:js');
  gulp.start('pages:html');
	gulp.start('mapfile:js');
	gulp.start('mapfile:css');


});

gulp.watch(['resources/*/*.*','resources/*.*'], function(event) {
    gulp.start('app:run');
});
