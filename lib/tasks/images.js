
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.images) return done()
		var c = require('better-console')
		c.info('~ images')

		var imagemin = require('gulp-imagemin')
		var pngquant = require('imagemin-pngquant')

		var task = gulp.src(config.images, { base: config.src_folder })

		task = task.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		}))


		return task.pipe(gulp.dest(config.dist_folder))
	}
}
