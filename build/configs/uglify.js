module.exports = {
    //Legacy flatpack, remove after 6.0
    auiFlatpack: {
        options: {
            beautify: {
                ascii_only: true
            }
        },
        files: {
          'dist/aui/js/aui.js': ['.tmp/aui/js/aui.js'],
          'dist/aui/js/aui-dependencies.js': ['.tmp/aui/js/aui-dependencies.js'],
          'dist/aui/js/aui-experimental.js': ['.tmp/aui/js/aui-experimental.js'],
          'dist/aui/js/aui-soy.js': ['.tmp/aui/js/aui-soy.js'],
          'dist/aui/js/aui-all.js': ['.tmp/aui/js/aui-all.js']
        }
    },
    auiFlatpackNextJs: {
        options: {
            beautify: {
                ascii_only: true,
                quote_keys: true
            }
        },
        files: {
            'dist/aui-next/js/aui-datepicker.min.js': ['<%= paths.dist %>aui-next/js/aui-datepicker.js'],
            'dist/aui-next/js/aui-experimental.min.js': ['<%= paths.dist %>aui-next/js/aui-experimental.js'],
            'dist/aui-next/js/aui-soy.min.js': ['<%= paths.dist %>aui-next/js/aui-soy.js'],
            'dist/aui-next/js/aui.min.js': ['<%= paths.dist %>aui-next/js/aui.js']
        }
    }
};
