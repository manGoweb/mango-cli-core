var c = require('better-console')
var path = require('path')
var pkg = require('../package.json')
var semver = require('semver')
var util = require('util')

var Mango = module.exports = function(folder, config) {
	this.config = config || {}
	this.config.dir = folder
	this.config.devmode = false
	this.defaultTasks = ['styles', 'scripts', 'templates', 'images', 'static']
	this.checkVersion()
}

Mango.prototype.checkVersion = function() {
	if(this.config.version && !semver.satisfies(pkg.version, this.config.version)){
		c.error('Installed version of the mango-cli (' + pkg.version + ') doesn\'t satisfy the version specified in mango.json (' + this.config.version + ')')
		process.exit(1)
	}
}

Mango.prototype.install = function(callback) {
	c.info('Installing NPM packages')

	if(!this.config.dependencies || !this.config.dependencies.length){
		c.log('~ no dependencies to install')
		if(callback instanceof Function) callback()
		return
	}

	var runcmd = require('./helpers/runcmd')
	var cmd = 'npm install --no-optional '

	// Serialize dependencies into string
	cmd += this.config.dependencies.join(' ')

	// Run in command line
	runcmd(cmd, this.config.dir, function() {
		if(callback instanceof Function) callback()
	})
}

Mango.prototype._cleanup = function() {
	if(this.config.dist_folder && this.config.cleanup !== false){
		c.warn('~ cleaning dist folder')
		var del = require('del')
		var path = require('path')
		var dir = path.resolve(this.config.dir, this.config.dist_folder)
		return del.sync(dir, { force: true })
	}
	return false
}

Mango.prototype.build = function(tasks, callback) {
	c.info('Building project assets for production')
	var gulp = require('gulp')

	this._registerGulpTasks(gulp)

	if(!tasks || !tasks.length){
		tasks = 'compile'
		this._cleanup()
	}

	gulp.start(tasks, callback)
}

Mango.prototype._registerGulpTasks = function(gulp) {

	// Filter tasks with missing config entry
	var activeTasks = this.defaultTasks.filter(function(task) {
		if(this.config[task]){
			var fn = require('./tasks/' + task)(gulp, this.config)
			return gulp.task(task, fn)
		}
		return false
	}, this)

	// Join build tasks together
	gulp.task('compile', activeTasks)
}


