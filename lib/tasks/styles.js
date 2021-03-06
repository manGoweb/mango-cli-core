
module.exports = function(gulp, config) {

	return function(done) {
		if(!config.styles) return done()
		var c = require('better-console')
		c.info('~ styles')

		var autoprefixer = require('autoprefixer')
		var minifycss = require('gulp-minify-css')
		var gulpFilter = require('gulp-filter')
		var less = require('gulp-less')
		var nib = require('nib')
		var postcss = require('gulp-postcss')
		var sass = require('gulp-sass')
		var stylus = require('gulp-stylus')
		var assign = require('lodash/object/assign')

		var filterLess = gulpFilter('**/*.less', { restore: true })
		var filterSass = gulpFilter('**/*.scss', { restore: true })
		var filterStylus = gulpFilter('**/*.styl', { restore: true })

		var task = gulp.src(config.styles, { base: config.src_folder })

		var stylusOptions = assign({}, {
			use: nib(),
			define: {
				debug: config.devmode
			},
			'include css': true
		}, config.stylus | {})

		// Stylus part
		task = task.pipe(filterStylus)
			.pipe(stylus(stylusOptions))
			.pipe(filterStylus.restore)
		// Sass part
			.pipe(filterSass)
			.pipe(sass())
			.pipe(filterSass.restore)
		// LESS part
			.pipe(filterLess)
			.pipe(less())
			.pipe(filterLess.restore)
		// Autoprefixer with custom options
			.pipe(postcss([
				autoprefixer(config.autoprefixer ? config.autoprefixer : {
					cascade: false, remove: false
				})
			]))

		if(config.cssmin !== false) {
			task = task.pipe(minifycss(config.cssmin ? config.cssmin : {
				advanced: false,
				noAdvanced: true
			}))
		}


		return task.pipe(gulp.dest(config.dist_folder))
	}
}
