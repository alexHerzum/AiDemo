module.exports = function (grunt) {
    return {
        options: require('./karma-shared')(grunt),
        cli: {
            options: {
                singleRun: !grunt.option('debug'),
                junitReporter: {
                    outputFile: 'tests/karma-jquery-<%= jquery %>.xml'
                }
            }
        },
        flatpack: {
            options: {
                junitReporter: {
                    outputFile: 'tests/karma-jquery-<%= jquery %>-flatpack.xml'
                },
                frameworks: ['mocha', 'requirejs', 'sinon-chai'],
                singleRun: true,
                files: [
                    'src/css/layer.css',
                    'src/css/tabs.css',
                    'tests/unit/atlassian-js/atlassian-js-test.css',
                    'bower_components/skate/dist/skate.js',
                    '<%= paths.bowerSource %>/jquery/jquery.js',
                    '<%= paths.bowerSource %>/jquery/dist/jquery.js',
                    '<%= paths.bowerSource %>/jquery-migrate/jquery-migrate.js',
                    {
                        pattern: '<%= paths.dist %>' + 'aui-next/js/*.js',
                        included: false
                    },
                    // progress-data-set and restful table need to be included manually because the flatpack does not have it
                    {
                        pattern: '<%= paths.jsSource %>' + 'experimental-autocomplete/*.js',
                        included: false
                    }, {
                        pattern: '<%= paths.jsSource %>' + 'experimental-restfultable/*.js',
                        included: false
                    }, {
                        pattern: '<%= paths.jsSource %>' + 'experimental-events/events.js',
                        included: false
                    }, {
                        pattern: '<%= paths.jsVendorSource %>' + 'backbone/backbone.js',
                        included: false
                    }, {
                        pattern: '<%= paths.jsVendorSource %>' + 'underscorejs/underscore.js',
                        included: false
                    }, {
                        pattern: '<%= paths.jsVendorSource %>' + 'jquery/serializetoobject.js',
                        included: false
                    },
                    // end progress-data-set and restful table

                    // tests
                    {
                        pattern: 'tests/unit/aui-mocha.js',
                        included: false
                    }, {
                        pattern: 'tests/unit/jquery-loader.js',
                        included: false
                    }, {
                        pattern: 'tests/unit/{*,**/*}-test.js',
                        included: false
                    },
                    'tests/unit/karma-flatpack-main.js'
                ]
            }

        }
    };
};
