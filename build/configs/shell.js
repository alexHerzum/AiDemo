module.exports = function () {
    'use strict';

    return {
        options: {
            stdout: true
        },
        amdStubs: {
            command: [
                'rm -rf .tmp/amd-stubs',
                'mkdir -p .tmp/amd-stubs',
                'touch .tmp/amd-stubs/aui-datepicker.js',
                'touch .tmp/amd-stubs/aui-experimental.js',
                'touch .tmp/amd-stubs/aui-soy.js',
                'touch .tmp/amd-stubs/aui.js',
                'touch .tmp/amd-stubs/DO-NOT-USE-DOGE.js'
            ].join('&&')
        },
        flatpackI18n: {
            command: 'build/bin/propertiesToJs.sh en',
        }
    };
};
