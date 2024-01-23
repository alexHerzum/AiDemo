/**
 * @fileOverview Configuration for generating the old aui flatpack.
 * @deprecated to be removed in 6.0.
 */
module.exports = {
    options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
    },

    auiAll: {
        files: {
            '.tmp/aui/css/aui-all.css': [
                '.tmp/aui/css/aui.css',
                '.tmp/aui/css/aui-experimental.css'
            ]
        }
    },
    auiFlatpack: {
        files: {
            '.tmp/aui/js/aui.js': [
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-compatibility.js',
                '<%= paths.jsVendorSource %>' + 'jquery/plugins/jquery.form.js',
                '<%= paths.jsVendorSource %>' + 'jquery/plugins/jquery.aop.js',
                '<%= paths.jsSource %>' + 'raphael/raphael.shadow.js',
                '<%= paths.jsSource %>' + 'jquery/jquery.os.js',
                '<%= paths.jsSource %>' + 'jquery/jquery.hotkeys.js',
                '<%= paths.jsSource %>' + 'jquery/jquery.moveto.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.datepicker.js',
                '<%= paths.jsSource %>' + 'aui/internal/deprecation.js',
                '<%= paths.jsSource %>' + 'aui.js',
                '<%= paths.jsSource %>' + 'format.js',
                '<%= paths.tmp %>' + 'aui.properties.js',
                '<%= paths.jsSource %>' + 'aui/internal/browser.js',
                '<%= paths.jsSource %>' + 'aui/internal/widget.js',
                '<%= paths.jsSource %>' + 'layer-manager.js',
                '<%= paths.jsSource %>' + 'layer-manager-global.js',
                '<%= paths.jsSource %>' + 'focus-manager.js',
                '<%= paths.jsSource %>' + 'cookie.js',
                '<%= paths.jsSource %>' + 'blanket.js',
                '<%= paths.jsSource %>' + 'layer.js',
                '<%= paths.jsSource %>' + 'dialog.js',
                '<%= paths.jsSource %>' + 'dialog2.js',
                '<%= paths.jsSource %>' + 'aui-date-picker.js',
                '<%= paths.jsSource %>' + 'dropdown.js',
                '<%= paths.jsSource %>' + 'dropdown2.js',
                '<%= paths.jsSource %>' + 'event.js',
                '<%= paths.jsSource %>' + 'firebug.js',
                '<%= paths.jsSource %>' + 'forms.js',
                '<%= paths.jsSource %>' + 'inline-dialog.js',
                '<%= paths.jsSource %>' + 'keyCode.js',
                '<%= paths.jsSource %>' + 'messages.js',
                '<%= paths.jsSource %>' + 'tabs.js',
                '<%= paths.jsSource %>' + 'template.js',
                '<%= paths.jsSource %>' + 'whenitype.js',
                '<%= paths.jsSource %>' + 'aui-header-responsive.js',
                '<%= paths.bowerSource %>' + 'fancy-file-input/dist/fancy-file-input.js'
            ],
            '.tmp/aui/js/aui-dependencies.js': [
                'dist/jquery.js',
                '<%= paths.bowerSource %>' + 'skate/dist/skate.js',
                '<%= paths.bowerSource %>' + 'tether/tether.js',
                '<%= paths.bowerSource %>' + 'jquery-1.8.3/index.js',
                '<%= paths.jsVendorSource %>' + 'raf/raf.js',
                '<%= paths.jsVendorSource %>' + 'raphael/raphael.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.core.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.widget.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.mouse.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.draggable.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery-ui/jquery.ui.sortable.js'
            ],
            // Older experimental components with global variables.
            '.tmp/aui/js/aui-experimental.js': [
                '<%= paths.jsVendorSource %>' + 'jquery/jquery.tipsy.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery.tablesorter.js',
                '<%= paths.jsVendorSource %>' + 'spin/spin.js',
                '<%= paths.jsVendorSource %>' + 'jquery/jquery.spin.js',
                '<%= paths.jsVendorSource %>' + 'jquery/plugins/jquery.select2.js',
                '<%= paths.jsVendorSource %>' + 'modernizr/modernizr-touch.js',
                '<%= paths.jsVendorSource %>' + 'raf/raf.js',
                '<%= paths.jsSource %>' + 'aui-experimental-tooltip.js',
                '<%= paths.jsSource %>' + 'aui-experimental-tables-sortable.js',
                '<%= paths.jsSource %>' + 'aui-experimental-expander.js',
                '<%= paths.jsSource %>' + 'aui-experimental-progress-indicator.js',
                '<%= paths.jsSource %>' + 'aui-select2.js',
                '<%= paths.jsSource %>' + 'aui-navigation.js',
                '<%= paths.jsSource %>' + 'aui-sidebar.js'
            ],
            // Newer experimental components that require an AMD loader to be present.
            // NOTE: this file is *not* being run through r.js, so all define() blocks will be anonymous!
            '.tmp/aui/js/aui-experimental-amd.js': [
                '<%= paths.jsSource %>' + 'aui/button.js',
                '<%= paths.jsSource %>' + 'aui/trigger.js',
                '<%= paths.jsSource %>' + 'aui/inline-dialog2.js',
                '<%= paths.jsSource %>' + 'aui/flag.js',
                '<%= paths.jsSource %>' + 'aui/form-notification.js',
                '<%= paths.jsSource %>' + 'aui/form-validation/validator-register.js',
                '<%= paths.jsSource %>' + 'aui/form-validation/basic-validators.js',
                '<%= paths.jsSource %>' + 'aui/form-validation.js',
                '<%= paths.jsSource %>' + 'aui/checkbox-multiselect.js'
            ],
            '.tmp/aui/js/aui-soy.js': [
                '<%= paths.bowerSource %>/soyutils/js/soyutils.js',
                '<%= paths.compiledSoySource %>' +'*.js'
            ],
            // All of the AUI code, EXCEPT for the code that requires an AMD loader.
            '.tmp/aui/js/aui-all.js': [
                '.tmp/aui/js/aui-dependencies.js',
                '.tmp/aui/js/aui.js',
                '.tmp/aui/js/aui-experimental.js',
                '.tmp/aui/js/aui-soy.js'
            ]
        }
    }
    // End old flatpack.
};
