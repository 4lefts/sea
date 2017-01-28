const 	gulp = require('gulp'),
		babel = require('gulp-babel'),
		ghPages = require('gulp-gh-pages'),
		browsersync = require('browser-sync').create()

function errorLog(err){
	console.error(err.message)
}

gulp.task('buildJS', () => {
	return	gulp.src('src/**/*.js')
				.pipe(babel())
				.pipe(gulp.dest('public'))
})

gulp.task('copyHTML', () => {
	return	gulp.src('src/**/*.html')
				.pipe(gulp.dest('public'))
})

gulp.task('serve', () => {
	browsersync.init({
		server: {
			baseDir: 'public',
		}
	})
})

gulp.task('refresh', ['copyHTML', 'buildJS'], () => {
	return browsersync.reload()
})

gulp.task('watch', () => {
	gulp.watch('src/**', ['refresh'])
})

gulp.task('default', ['copyHTML', 'buildJS', 'serve', 'watch'])

//deploy to github pages - not part of default task
//excellent walkthrough of how to set up github pages and how to use this at:
//http://charliegleason.com/articles/deploying-to-github-pages-with-gulp
gulp.task('deploy', ['copyHTML', 'buildJS'], () => {
	return 	gulp.src('./public/**/*')
				.pipe(ghPages())
})