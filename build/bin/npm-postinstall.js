var helper = require('./bin-helper');

helper.chain([
    [helper.npmNormalize('./node_modules/.bin/bower'), ['install']],
    ['jar', ['xf', 'index.jar'], {
        cwd: helper.pathNormalize('./bower_components/soyutils')
    }]
]);