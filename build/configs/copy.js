module.exports = {
    auiFlatpackAssets: {
        files: [{
            cwd: '<%= paths.styleSource %>images',
            dest:  '<%= paths.dist %>aui-next/css/',
            expand: true,
            filter: 'isFile',
            src: ['**']
        }, {
            cwd: '<%= paths.styleSource %>images',
            dest:  '<%= paths.dist %>aui/css/',
            expand: true,
            filter: 'isFile',
            src: ['**']
        },{
            // Select2 assets
            cwd: '<%= paths.cssVendorSource %>jquery/plugins/',
            dest:  '<%= paths.dist %>aui/css/',
            expand: true,
            filter: 'isFile',
            src: ['**', '!*.css']
        },{
            cwd: '<%= paths.cssVendorSource %>jquery/plugins/',
            dest:  '<%= paths.dist %>aui-next/css/',
            expand: true,
            filter: 'isFile',
            src: ['**', '!*.css']
        }]
    },
    auiFlatpackNextJs: {
        files: [{
            cwd:  '<%= paths.tmp %>amd-stubs',
            expand: true,
            dest:  '<%= paths.dist %>aui-next/js',
            filter: 'isFile',
            src: [
                'aui-datepicker.js',
                'aui-experimental.js',
                'aui-soy.js',
                'aui.js'
            ]
        }]
    },
    requirejsTransformed: {
        files: [{
            cwd: 'bower_components',
            expand: true,
            dest: '.tmp/requirejs-transformed/bower_components',
            filter: 'isFile',
            src: ['**/*']
        }]
    }
};
