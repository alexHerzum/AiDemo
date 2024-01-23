module.exports = {
    core: {
        options: {
            i18nBundle: '<%= paths.i18nBundle %>',
            baseDir: '<%= paths.soySource %>',
            glob: '**.soy',
            outDir: '.tmp/compiled-soy'
        }
    }
};