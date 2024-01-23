module.exports = {
    dist: {
        options: {
            paths: ['src/less'],
            ieCompat: true
        },
        files: {
            'dist/aui-next/css/aui.css': '<%= paths.styleSource %>/batch/main.less',
            'dist/aui-next/css/aui-experimental.css': '<%= paths.styleSource %>/batch/experimental.less',
            'dist/aui-next/css/aui-ie9.css': '<%= paths.styleSource %>/batch/ie9.less',

            // DEPRECATED: legacy flatpack.
            '.tmp/aui/css/aui.css': [
                '<%= paths.styleSource %>aui-reset.less',
                '<%= paths.styleSource %>aui-page-typography.less',
                '<%= paths.styleSource %>aui-avatars.less',
                '<%= paths.styleSource %>aui-badge.less',
                '<%= paths.styleSource %>aui-buttons.less',
                '<%= paths.styleSource %>aui-header.less',
                '<%= paths.styleSource %>aui-lozenge.less',
                '<%= paths.styleSource %>aui-navigation.less',
                '<%= paths.styleSource %>aui-page-layout.less',
                '<%= paths.styleSource %>aui-page-header.less',
                '<%= paths.styleSource %>aui-toolbar2.less',
                '<%= paths.styleSource %>basic.less',
                '<%= paths.styleSource %>dialog.less',
                '<%= paths.styleSource %>layer.less',
                '<%= paths.styleSource %>dialog2.less',
                '<%= paths.styleSource %>dropdown.less',
                '<%= paths.styleSource %>dropdown2.less',
                '<%= paths.styleSource %>forms.less',
                '<%= paths.styleSource %>icons.less',
                '<%= paths.styleSource %>inline-dialog.less',
                '<%= paths.styleSource %>aui-date-picker.less',
                '<%= paths.styleSource %>messages.less',
                '<%= paths.styleSource %>aui-banner.less',
                '<%= paths.styleSource %>aui-banner-message-header-interop.less',
                '<%= paths.styleSource %>tables.less',
                '<%= paths.styleSource %>tabs.less',
                '<%= paths.styleSource %>toolbar.less',
                '<%= paths.bowerSource %>fancy-file-input/dist/fancy-file-input.css',
            ],
            '.tmp/aui/css/aui-experimental.css': [
                '<%= paths.styleSource %>aui-module.less',
                '<%= paths.styleSource %>aui-experimental-labels.less',
                '<%= paths.styleSource %>aui-experimental-tables-sortable.less',
                '<%= paths.styleSource %>aui-experimental-progress-tracker.less',
                '<%= paths.cssVendorSource %>jquery/jquery.tipsy.css',
                '<%= paths.styleSource %>aui-experimental-tooltip.less',
                '<%= paths.styleSource %>aui-experimental-expander.less',
                '<%= paths.styleSource %>aui-experimental-progress-indicator.less',
                '<%= paths.cssVendorSource %>jquery/plugins/jquery.select2.css',
                '<%= paths.styleSource %>aui-select2.less',
                '<%= paths.styleSource %>flag.less',
                '<%= paths.styleSource %>form-notification.less',
                '<%= paths.styleSource %>form-validation.less',
                '<%= paths.styleSource %>checkbox-multiselect.less'
            ],
            '.tmp/aui/css/aui-ie9.css': [
                '<%= paths.styleSource %>aui-badge-ie.less'
            ]
            // END DEPRECATED
        }
    }
};