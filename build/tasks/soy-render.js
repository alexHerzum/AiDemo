module.exports = function(grunt) {
    'use strict';

    var spawn = require('child_process').spawn;

    grunt.registerMultiTask('soy-render', 'Renders soy.', function() {
        var opts = this.options();
        var done = this.async();
        var params = [
            '-jar', './build/jar/atlassian-soy-cli-support-2.4.0-SNAPSHOT-jar-with-dependencies.jar',
            '--type', 'render',
            '--i18n', opts.i18nBundle,
            '--basedir', opts.baseDir,
            '--glob', opts.glob,
            '--outdir', opts.outDir
        ];
        if (opts.outputExtension) {
            params = params.concat(['--extension', opts.outputExtension]);
        }
        if (opts.rootNamespace) {
            params = params.concat(['--rootnamespace', opts.rootNamespace]);
        }
        if (opts.dependencies) {
            var depString = opts.dependencies.map(function(dep) {
                return dep.baseDir + ':' + dep.glob;
            }).join(',');
            params = params.concat(['--dependencies', depString]);
        }
        if (opts.data) {
            var dataString = Object.keys(opts.data).map(function(key) {
                return key + ':' + opts.data[key];
            }).join(',');
            params = params.concat(['--data', dataString]);
        }
        var javaExec = process.env.JAVA_HOME ? process.env.JAVA_HOME + '/bin/java' : 'java';
        var cmd = spawn(javaExec, params);

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