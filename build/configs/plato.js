module.exports = function (grunt) {
    return {
        all: {
            files: {
                'reports/plato': ['src/js/{**/*,*}.js']
            }
        }
    };
};
