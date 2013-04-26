/*global module:false*/
module.exports = function(grunt) {

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    datetime: Date.now(),

	compass: {
		d: {
			options: {
				sassDir: 'src/scss/',
				cssDir: 'www/css',
				imagesDir: 'www/images',
				outputStyle: 'compressed',
				environment: 'production'
			}
		}
    },

	uglify: {
		dev: {
			options: {
				preserveComments: 'some',
				compress: false,
				beautify: true
			},
			files: {
				'www/js/main.min.js': [
					'src/js/Location.js',
					'src/js/Trip.js',
					'src/js/Edit.js',
					'src/js/Home.js',
					'src/js/Main.js'
				],
				'www/js/lib.min.js': [
					'src/js/lib/jquery/jquery-ui-1.9.0.custom.min.js',
					'src/js/lib/jquery/jquery.cookie.min.js',
					'src/js/lib/jquery/jquery.dd.js',
					'src/js/lib/json2.js',
					'src/js/utility/*.js'
				]
			}
		},
		prod: {
			options: {
				preserveComments: 'some'
			},
			files: {
				'www/js/main.min.js': [
					'src/js/Location.js',
					'src/js/Trip.js',
					'src/js/Edit.js',
					'src/js/Home.js',
					'src/js/Main.js'
				],
				'www/js/lib.min.js': [
					'src/js/lib/jquery/jquery-ui-1.9.0.custom.min.js',
					'src/js/lib/jquery/jquery.cookie.min.js',
					'src/js/lib/jquery/jquery.dd.js',
					'src/js/lib/json2.js',
					'src/js/utility/*.js'
				]
			}
		}
	},

	watch: {
		styles: {
			files: 'src/scss/*.scss',
			tasks: ['compass'],
			options: {
				interrupt: true
			}
		},
		scripts: {
			files: 'src/js/**/*.js',
			tasks: ['uglify:dev'],
			options: {
				interrupt: true
			}
		}
	}
});

grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');

// Default task.
grunt.registerTask('default', ['watch']);
grunt.registerTask('dev', ['compass', 'uglify:dev']);
grunt.registerTask('prod', ['compass', 'uglify:prod']);
};