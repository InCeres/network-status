module.exports = function (grunt) {
  var format = function(str, data) {
    return str.replace(/{([^{}]+)}/g, function(match, val) {
      var prop = data;
      val.split('.').forEach(function(key) {
        prop = prop[key];
      });

      return prop;
    });
  };

  String.prototype.format = function(data) {
    return format(this, data);
  };

  var srcFolder         = 'src';
  var distFolder         = 'dist';
  var distFile         = '{0}/js/network-status.js'.format([distFolder]);
  var distCssFile         = '{0}/scss'.format([distFolder]);
  var distImgFile         = '{0}/img'.format([distFolder]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      img: {
        files: [
          {expand: true, cwd: srcFolder, src: ['img/*'], dest: distFolder}
        ]
      },
      scss: {
        files: [
          {expand: true, cwd: srcFolder, src: ['scss/*'], dest: distFolder}
        ]
      }
    },

    concat: {
      options: {},
      dist: {
        src: [
          "{0}/**/*.js".format([srcFolder])
        ],
        dest: distFile
      }
    },

    uglify: {
      options: {},
      dist: {
        files: {
          'dist/js/network-status.min.js': [distFile]
        }
      }
    },

    clean: {
      dist: {
        src: ['{0}/**/*.*'.format([distFolder])]
      }
    },

    watch: {
      options: {
      },
      src: {
        files: [
          "{0}/**/*.js".format([srcFolder])
        ],
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'copy', 'concat', 'uglify']);
};
