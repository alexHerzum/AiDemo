module.exports = function(grunt) {
    'use strict';

    var spawn = require('child_process').spawn;

    grunt.registerMultiTask('soy-compile', 'Compiles soy to js.', function() {
        var opts = this.options();
        var done = this.async();
        var javaExec = process.env.JAVA_HOME ? process.env.JAVA_HOME + '/bin/java' : 'java';
        var cmd = spawn(javaExec, [
            '-jar', './build/jar/atlassian-soy-cli-support-2.4.0-SNAPSHOT-jar-with-dependencies.jar',
            '--type', 'js',
            '--i18n', opts.i18nBundle,
            '--basedir', opts.baseDir,
            '--glob', opts.glob,
            '--outdir', opts.outDir
        ]);

        cmd.stderr.on('data', function(data) {
            grunt.log.error(data);
        });

        cmd.stdout.on('data', function(data) {
            grunt.log.writeln(data);
        });

        cmd.on('close', function(code) {
            done(code === 0);
        });
    });
};
