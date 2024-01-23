module.exports = function (grunt) {
    'use strict';
    var browsers = ['PhantomJS'];
    if (grunt && grunt.option && grunt.option('browsers')) {
        browsers = grunt.option('browsers');
        browsers = browsers.trim().replace(/[\s,]+/,' ');
        browsers = browsers.split(' ');
    }

    return {
        frameworks: ['mocha', 'requirejs', 'sinon-chai'],
        browsers: browsers,
        reporters: ['coverage', 'progress', 'junit'],
        coverageReporter: {
            dir: 'reports/istanbul',
            type: 'html'
        },
        junitReporter: {
            outputFile: 'tests/karma.xml',
            suite: ''
        },
        preprocessors: {
            'src/js/{**/*,*}.js': 'coverage',
            'src/less/{**/*,*}.less': 'less'
        },
        lessPreprocessor: {
            options: {
                paths: ['src/less']
            }
        },
        files: [
            // karma + requireJS config
            '.tmp/tests-requirejs-config.js',

            'tests/unit/karma-main.js',
            'tests/unit/polyfills.js',

            // CSS
            'src/less/layer.less',
            'src/less/tabs.less',
            'tests/unit/atlassian-js/atlassian-js-test.css',

            // unpacked
            {pattern: 'bower_components/jquery/jquery.js', included: false},
            {pattern: 'bower_components/jquery/dist/jquery.js', included: false},
            {pattern: 'bower_components/jquery-migrate/jquery-migrate.js', included: false},
            {pattern: 'bower_components/tether/tether.js', included: false},
            {pattern: 'bower_components/soyutils/js/soyutils.js', included: false},
            {pattern: 'bower_components/skate/dist/skate.js', included: false},
            {pattern: '.tmp/compiled-soy/*.js', included: false},

            // main
            {pattern: 'src/**/*.js', included: false},

            // test
            {pattern: 'tests/unit/aui-mocha.js', included: false},
            {pattern: 'tests/unit/jquery-loader.js', included: false},
            {pattern: 'tests/unit/{*,**/*}-test.js', included: false}

        ]
    };
};