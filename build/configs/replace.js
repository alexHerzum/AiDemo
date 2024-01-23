module.exports = {
    projectVersion:{
        src: ['dist/**/*.js', 'dist/**/*.html', 'dist/**/*.css'],
        overwrite: true,
        replacements: [{
            from: /\${project.version}/,
            to: '<%= pkg.version %>'
        }]
    }
};
