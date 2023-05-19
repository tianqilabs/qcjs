module.exports = function (grunt) {
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
                    "src/control/editor.js",
                    "src/control/treeview.js",
                    "src/control/sheet.js"],
                dest: "dist/<%= pkg.name %>-util.js"
            }
        },
        watch: {
            js: {
                files: ["src/*/*.js"],
                tasks: ['concat', 'uglify', 'copy:zg_js']
            },
            css: {
                files: ["doc/css/qcjs.css"],
                tasks: ['copy:zg_css']
            }
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
        },
        copy: {
            zg_js: {
                files: [
                    {
                        expand: true,
                        src: ['dist/**'],
                        dest: 'H:/mydisk/deveplor/na/code/platform/qcjs/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        src: ['dist/**'],
                        dest: 'H:/mydisk/deveplor/na/code/platform/util/',
                        flatten: true,
                        filter: 'isFile'
                    },
                    // {
                    //     expand: true,
                    //     src: ['dist/**'],
                    //     dest: 'E:/mydisk/deveplor/com.tianqilabs/zhangui/project/zg-cash2/web/qcjs/',
                    //     flatten: true,
                    //     filter: 'isFile'
                    // },
                    // {
                    //     expand: true,
                    //     // src: ['dist/**', 'src/control/**'],
                    //     src: ['dist/<%= pkg.name %>-core.min.js', 'dist/<%= pkg.name %>-util.min.js'],
                    //     dest: 'H:/mydisk/deveplor/com.tianqilabs/deoloy/zgapp/zgcash2_war_exploded/qcjs/',
                    //     flatten: true,
                    //     filter: 'isFile'
                    // },
                    // {
                    //     expand: true,
                    //     src: ['dist/<%= pkg.name %>-core.min.js', 'dist/<%= pkg.name %>-util.min.js'],
                    //     dest: 'H:/mydisk/deveplor/com.tianqilabs/chqxj_dev/webApp/web/qcjs/',
                    //     flatten: true,
                    //     filter: 'isFile'
                    // },
                    // {
                    //     expand: true,
                    //     src: ['dist/<%= pkg.name %>-core.min.js', 'dist/<%= pkg.name %>-util.min.js'],
                    //     dest: 'H:/mydisk/deveplor/com.tianqilabs/deoloy/chqxj_dev/webApp/qcjs/',
                    //     flatten: true,
                    //     filter: 'isFile'
                    // }
                ]
            },
            // zg_css: {
            //     files: [
            //         {
            //             src: ['doc/css/qcjs.css'],
            //             dest: 'E:/mydisk/deveplor/com.tianqilabs/zhangui/project/zg-cash2/web/css/def/qcjs.css'
            //         },
            //         {
            //             src: ['doc/css/qcjs.css'],
            //             dest: 'E:/mydisk/deveplor/com.tianqilabs/zhangui/project/out/artifacts/zgcash2_war_exploded/css/def/qcjs.css'
            //         }
            //     ]
            // }
        }
    });

    require("load-grunt-tasks")(grunt);

    // grunt.registerTask('default', ['concat', 'uglify', 'copy', 'watch']);
    grunt.registerTask('default', ['watch']);

};