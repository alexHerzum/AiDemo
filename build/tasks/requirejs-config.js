module.exports = function(grunt) {
    'use strict';

    var path = require('path');
    var spawn = require('child_process').spawn;
    var write = require('fs').writeFile;


    grunt.registerMultiTask(
        'requirejs-config',
        'Takes a requirejs configuration stored in a CommonJS module and writes it to a file that declares it as the requireConfig global.',
        task
    );


    function task() {
        var opts = this.options({
                dest: '.tmp/tests-requirejs-config.js',
                src: '../configs/requirejs'
            });

        var config = require(opts.src).options;
        var destDir = path.dirname(opts.dest);
        var done = this.async();
        var mkdirp = spawn('mkdir', ['-p', destDir]);

        mkdirp.on('close', function() {
            write(opts.dest, toJs(config), done);
        });
    }

    function toJs(json) {
        return 'window.requireConfig=' + JSON.stringify(json) + ';';
    }
};
