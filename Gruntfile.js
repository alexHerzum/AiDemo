module.exports = function (grunt) {
    'use strict';

    var config = require('./build/configs')(grunt);

    config.jquery = grunt.option('jquery') || '1.8.3';
    config.pkg = grunt.file.readJSON('package.json');
    config.paths = {
        jsSource: 'src/js/',
        jsVendorSource: 'src/js-vendor/',
        bowerSource: 'bower_components/',
        styleSource: 'src/less/',
        cssVendorSource: 'src/css-vendor/',
        soySource: 'src/soy/',
        compiledSoySource: '.tmp/compiled-soy/',
        i18nBundle: 'src/i18n/aui.properties',
        dist: 'dist/',
        tmp: '.tmp/'
    };

    grunt.initConfig(config);

    grunt.loadTasks('build/tasks');
    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('default', 'Shows the available tasks.', 'availabletasks');
    grunt.registerTask('lint', 'Lints the code using JSHint and JSCS.', ['jshint', 'jscs']);
    grunt.registerTask('test', 'Runs the unit tests.', ['soy-compile:core', 'requirejs-config', 'karma:cli', 'clean:tmp']);
    grunt.registerTask('test-debug', 'Runs the unit tests.', ['watch:test', 'clean:tmp']);
    grunt.registerTask('test-dist', 'Runs the unit tests with the dist', ['flatpack', 'requirejs-config', 'karma:flatpack', 'clean:tmp', 'clean:dist']);

    grunt.registerTask('build', 'Builds AUI', [
        'build-soy-and-js',
        'less:dist',
        'concat:auiAll',
        'cssmin:dist',

        // DEPRECATED: old flatpack. Remove after 6.0.
        'cssmin:auiFlatpack',
        // END DEPRECATED

        'copy:auiFlatpackAssets',
        'replace:projectVersion',
        'clean:postFlatpackClean'
    ]);

    grunt.registerTask('build-soy-and-js', 'Builds AUI Soy and JavaScript', [
        'build-soy',
        'build-js'
    ]);

    grunt.registerTask('build-soy', 'Builds AUI Soy, copying it to the dist directory. Does not minify or concat for the old flatpack', [
        'soy-compile:core',
        'build-js-amd',
        'copy:auiFlatpackNextJs'
    ]);

    grunt.registerTask('build-js', 'Builds AUI JavaScript, including full minification and legacy flatpack', [
        'shell:flatpackI18n',
        'build-js-amd',
        'copy:auiFlatpackNextJs',
        'uglify:auiFlatpackNextJs',

        // DEPRECATED: old flatpack. Remove after 6.0.
        'concat:auiFlatpack',
        'uglify:auiFlatpack',
        // END DEPRECATED

        'replace:projectVersion',
        'clean:postFlatpackClean'
    ]);

    grunt.registerTask('build-js-amd', 'Creates AMD stubs and copies requirejs transformed dist files to the temp directory', [
        'shell:flatpackI18n',
        'shell:amdStubs',
        'copy:requirejsTransformed',
        'requirejs:dist'
    ]);

    grunt.registerTask('build-js-fast', 'Builds AUI JavaScript, with no deprecation and minification (for devspeed)', [
        'shell:flatpackI18n',
        'build-js-amd',
        'copy:auiFlatpackNextJs',
        'replace:projectVersion',
        'clean:postFlatpackClean'
    ]);
};
