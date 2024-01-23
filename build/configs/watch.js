module.exports = function (grunt) {
    // Overwrite the target files that are run by the lint command so that
    // it only checks the file that was modified.
    grunt.event.on('watch', function(action, filepath) {
        grunt.config('jscs.all', filepath);
        grunt.config('jshint.all', filepath);
    });

    return {
        lint: {
            files: [
                'Gruntfile.js',
                'src/js/{*,**/*}.js',
                'tests/js/{*,**/*}.js'
            ],
            options: {
                spawn: false
            },
            tasks: [
                'lint'
            ]
        },
        test: {
            files: [
                'src/**',
                'tests/unit/**'
            ],
            tasks: [
                'soy-compile:core',
                'requirejs-config',
                'karma:cli'
            ],
            options: {
                atBegin: true
            }
        }
    };
};
