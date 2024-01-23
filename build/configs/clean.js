module.exports = {
    dist: [
        'dist'
    ],
    tmp: [
        '.tmp'
    ],
    postFlatpackClean: [
        'dist/*',
        '!dist/aui',
        '!dist/aui-next'
    ],
    deps: [
        'node_modules',
        'bower_components'
    ]
};
