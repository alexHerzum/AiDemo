module.exports = {
    dist: {
        files: {
            'dist/aui-next/css/aui.min.css': ['dist/aui-next/css/aui.css'],
            'dist/aui-next/css/aui-experimental.min.css': ['dist/aui-next/css/aui-experimental.css'],
            'dist/aui-next/css/aui-ie9.min.css': ['dist/aui-next/css/aui-ie9.css']
        }
    },

    //old flatpack, remove after 6.0
    auiFlatpack: {
        files: {
            'dist/aui/css/aui.css': ['.tmp/aui/css/aui.css'],
            'dist/aui/css/aui-experimental.css': ['.tmp/aui/css/aui-experimental.css'],
            'dist/aui/css/aui-ie9.css': ['.tmp/aui/css/aui-ie9.css'],
            'dist/aui/css/aui-all.css': ['.tmp/aui/css/aui-all.css']
        }
    }
    //end old flatpack
};
