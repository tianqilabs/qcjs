module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/* ! <%= pkg.name %> (c) 老李 (20390965@qq.com) v<%= pkg.version %> */\n\n'
            },
            core: {
                src: [
                    "src/core/core.js",
                    "src/core/static.js",
                    "src/core/string.js",
                    "src/core/array.js",
                    "src/core/qcset.js",
                    "src/core/proto.js",
                    "src/core/event.js"],
                dest: "dist/<%= pkg.name %>-core.js"
            },
            util: {
                src: [
                    "src/control/util.js",
                    "src/control/popfrm.js",
                    "src/control/selector.js",
                    "src/control/colorpicker.js",
                    "src/control/datepicker.js",
                    "src/control/lister.js",
                    "src/control/pagepicker.js",
                    "src/control/editor.js"],
                dest: "dist/<%= pkg.name %>-util.js"
            }
        },
        watch: {
            files: [ "src/*/*.js" ],
            tasks: [ "concat", "uglify"]
        },
        uglify: {
            options: {
                banner: '/* ! <%= pkg.name %> (c) 老李 (20390965@qq.com) v<%= pkg.version %> */'
            },
            core: {
                files: {
                    'dist/<%= pkg.name %>-core.min.js': ['dist/<%= pkg.name %>-core.js']
                }
            },
            util: {
                files: {
                    'dist/<%= pkg.name %>-util.min.js': ['dist/<%= pkg.name %>-util.js']
                }
            }
        }
    });

    require( "load-grunt-tasks" )( grunt );

    grunt.registerTask('default', ['concat', 'uglify', "watch"]);

};