(function() {
    'use strict';

    var PATH_REQUIREJS_TRANSFORMED = '.tmp/requirejs-transformed';
    var PATH_BASEURL = 'src/js';

    var fs = require('fs-extra');
    var path = require('path');


    function bowerSource (file) {
        return rootSource('bower_components/' + file);
    }

    function compiledSoySource (file) {
        return rootSource('.tmp/compiled-soy/' + file);
    }

    function jsVendorSource (file) {
        return '../js-vendor/' + file;
    }

    function jsVendorFromModuleSource (file) {
        return '../../src/js-vendor/' + file;
    }

    function rootSource (file) {
        return '../../' + file;
    }


    var paths = {
        // Needed for flatpack
        // TODO: find a better way...
        'aui.properties': rootSource('.tmp/aui.properties'),

        // jQuery 1.x and 2.x
        'jquery': [
            bowerSource('jquery/jquery'),
            bowerSource('jquery/dist/jquery')
        ],

        // Required for jQuery 2.x
        'jquery-migrate': bowerSource('jquery-migrate/jquery-migrate'),

        'aui/internal/skate': bowerSource('skate/dist/skate'),
        'aui/internal/fancy-file-input': bowerSource('fancy-file-input/dist/fancy-file-input'),
        'aui/internal/tether': bowerSource('tether/tether'),

        // Unpacked soy dep
        'soyutils': bowerSource('soyutils/js/soyutils'),

        // Compiled soy
        'soy/aui': compiledSoySource('aui'),
        'soy/avatar':compiledSoySource('avatar'),
        'soy/badges': compiledSoySource('badges'),
        'soy/buttons': compiledSoySource('buttons'),
        'soy/dialog2': compiledSoySource('dialog2'),
        'soy/dropdown': compiledSoySource('dropdown'),
        'soy/dropdown2': compiledSoySource('dropdown2'),
        'soy/expander': compiledSoySource('expander'),
        'soy/form': compiledSoySource('form'),
        'soy/group': compiledSoySource('group'),
        'soy/icons': compiledSoySource('icons'),
        'soy/inline-dialog2': compiledSoySource('inline-dialog2'),
        'soy/lozenges': compiledSoySource('lozenges'),
        'soy/labels': compiledSoySource('labels'),
        'soy/message': compiledSoySource('message'),
        'soy/page': compiledSoySource('page'),
        'soy/panel': compiledSoySource('panel'),
        'soy/progress-tracker': compiledSoySource('progress-tracker'),
        'soy/table': compiledSoySource('table'),
        'soy/tabs': compiledSoySource('tabs'),
        'soy/toolbar': compiledSoySource('toolbar'),
        'soy/toolbar2': compiledSoySource('toolbar2'),
        'soy/trigger': compiledSoySource('trigger'),

        // Vendors
        'underscore': jsVendorSource('underscorejs/underscore'),
        'backbone': jsVendorSource('backbone/backbone'),
        'jquery.form': jsVendorSource('jquery/plugins/jquery.form'),
        'jquery.aop': jsVendorSource('jquery/plugins/jquery.aop'),
        'jquery.ui.datepicker':jsVendorSource('jquery/jquery-ui/jquery.ui.datepicker'),
        'serializetoobject': jsVendorSource('jquery/serializetoobject'),
        'jquery-select2': jsVendorSource('jquery/plugins/jquery.select2'),
        'jquery.tablesorter': jsVendorSource('jquery/jquery.tablesorter'),
        'jquery-compatibility': jsVendorSource('jquery/jquery-compatibility'),
        'modernizr-touch': jsVendorSource('modernizr/modernizr-touch'),
        'raf': jsVendorSource('raf/raf'),  // requestAnimationFrame shim.
        'aui/internal/spin': jsVendorSource('spin/spin'),
        'spin': jsVendorSource('jquery/jquery.spin'),
        'tipsy': jsVendorSource('jquery/jquery.tipsy'),

        // TODO: replace this with actual jquery ui deps
        'jquery-ui': jsVendorSource('jquery/jquery-ui/jquery-ui'),

        // Jquery stuff that isn't under vendor
        'jquery.os': 'jquery/jquery.os',
        'jquery.moveto': 'jquery/jquery.moveto',
        'jquery.hotkeys': 'jquery/jquery.hotkeys',

        // Misc - this stuff is required by AUI old flatpack, can remove after 6.0
        'raphael.shadow': 'raphael/raphael.shadow',

        // test deps
        'aui-mocha': rootSource('tests/unit/aui-mocha')
    };

    var config = {
        dist: {
            options: {
                baseUrl: PATH_BASEURL,
                preserveLicenseComments: false,
                optimize: 'none',
                skipDirOptimize: true,
                dir: '.tmp/requirejs-optimizer',

                // Builds a directory of files that retain the same structure as the originals that have been
                // transformed to include named defines.
                onBuildWrite: function (moduleName, modulePath, moduleContent) {
                    var realpath = paths[moduleName] || moduleName;
                    var original = path.normalize(PATH_REQUIREJS_TRANSFORMED + '/' + PATH_BASEURL + '/' + realpath);
                    fs.outputFileSync(original + '.js', moduleContent);
                    return moduleContent;
                },

                modules: [{
                    name: rootSource('.tmp/amd-stubs/aui'),
                    include: [
                        'aui/internal/skate',
                        'aui/internal/tether',
                        'jquery.os',
                        'jquery.moveto',
                        'format',
                        'aui/internal/widget',
                        'aui/internal/alignment',
                        'aui/internal/animation',
                        'aui/internal/browser',
                        'aui/internal/deprecation',
                        'aui.properties',
                        'layer-manager',
                        'layer-manager-global',
                        'focus-manager',
                        'layer',
                        'dialog2',
                        'cookie',
                        'dialog',
                        'dropdown2',
                        'event',
                        'forms',
                        'inline-dialog',
                        'keyCode',
                        'messages',
                        'tabs',
                        'template',
                        'whenitype',
                        'aui-header-responsive',
                        'aui/internal/fancy-file-input',
                        'aui-sidebar'
                    ],
                    exclude: [
                        'jquery',
                        'jquery-migrate'
                    ]
                }, {
                    name: rootSource('.tmp/amd-stubs/aui-datepicker'),
                    include: [
                        'aui-date-picker'
                    ],
                    exclude: [
                        rootSource('.tmp/amd-stubs/aui'),
                        rootSource('.tmp/amd-stubs/aui-experimental'),
                        'aui',
                        'jquery',
                        'jquery-migrate'
                    ]
                }, {
                    name: rootSource('.tmp/amd-stubs/aui-experimental'),
                    include: [
                        'tipsy',
                        'aui-experimental-expander',
                        'aui-experimental-progress-indicator',
                        'aui-experimental-tables-sortable',
                        'aui-experimental-tooltip',
                        'aui/form-validation',
                        'aui-select2',
                        'dialog2',
                        'aui/button',
                        'aui/trigger',
                        'aui/inline-dialog2',
                        'spin',
                        'aui-sidebar',
                        'aui/flag',
                        'aui/banner',
                        'aui/checkbox-multiselect'
                    ],
                    exclude: [
                        rootSource('.tmp/amd-stubs/aui'),
                        rootSource('.tmp/amd-stubs/aui-datepicker'),
                        'jquery',
                        'jquery-migrate'
                    ]
                }, {
                    name: rootSource('.tmp/amd-stubs/aui-soy'),
                    include: [
                        'soy/aui',
                        'soy/badges',
                        'soy/buttons',
                        'soy/dialog2',
                        'soy/dropdown',
                        'soy/dropdown2',
                        'soy/expander',
                        'soy/form',
                        'soy/group',
                        'soy/icons',
                        'soy/inline-dialog2',
                        'soy/lozenges',
                        'soy/labels',
                        'soy/message',
                        'soy/page',
                        'soy/panel',
                        'soy/progress-tracker',
                        'soy/table',
                        'soy/tabs',
                        'soy/toolbar',
                        'soy/toolbar2',
                        'soy/trigger',
                        'soy/avatar'
                    ],
                    exclude: [
                        rootSource('.tmp/amd-stubs/aui'),
                        rootSource('.tmp/amd-stubs/aui-experimental'),
                        'jquery',
                        'jquery-migrate'
                    ]
                }, {
                    // The only intention of this module is to ensure that all files that AUI does not depend on
                    // internally get transformed and included in the .tmp/src/* directories.
                    name: rootSource('.tmp/amd-stubs/DO-NOT-USE-DOGE'),
                    include: [
                        // js
                        'aui-experimental-example',
                        'binders/binder',
                        'binders/placeholder',
                        'containdropdown',
                        'experimental-autocomplete/progressive-data-set',
                        'experimental-autocomplete/query-input',
                        'experimental-autocomplete/query-result',
                        'experimental-autocomplete/truncating-progressive-data-set',
                        'experimental-events/events',
                        'experimental-restfultable/restfultable.all',
                        'experimental-restfultable/restfultable.customview',
                        'experimental-restfultable/restfultable.editrow',
                        'experimental-restfultable/restfultable.entrymodel',
                        'experimental-restfultable/restfultable',
                        'experimental-restfultable/restfultable.row',
                        'firebug',
                        'jquery/jquery.autocomplete',
                        'jquery/jquery.is-dirty',
                        'jquery/jquery.progressbar',
                        'jquery/jquery.selection',
                        'jquery/jquery.throbber',
                        'raphael/raphael.shadow',

                        // js-vendor
                        jsVendorFromModuleSource('backbone/backbone'),
                        jsVendorFromModuleSource('eve/eve'),
                        jsVendorFromModuleSource('jquery/jquery-compatibility'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery-ui'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.blind'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.bounce'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.clip'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.core'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.drop'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.explode'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.fade'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.fold'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.highlight'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.pulsate'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.scale'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.shake'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.slide'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.effects.transfer'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.accordion'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.autocomplete'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.button'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.core'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.dialog'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.draggable'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.droppable'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.mouse'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.position'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.progressbar'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.resizable'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.selectable'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.slider'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.sortable'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.tabs'),
                        jsVendorFromModuleSource('jquery/jquery-ui/jquery.ui.widget'),
                        jsVendorFromModuleSource('jquery/jquery.spin'),
                        jsVendorFromModuleSource('jquery/jquery.ui.menu'),
                        jsVendorFromModuleSource('jquery/plugins/jquery.form'),
                        jsVendorFromModuleSource('jquery/serializetoobject'),
                        jsVendorFromModuleSource('raphael/raphael'),
                        jsVendorFromModuleSource('underscorejs/underscore'),
                        jsVendorFromModuleSource('zepto/zepto')
                    ]
                }],
                skipModuleInsertion: true
            }
        },
        options: {
            baseUrl: '/src/js',
            paths: paths,
            shim: {
                // vendor
                'underscore': {
                    exports: '_'
                },
                'backbone': {
                    deps: ['jquery', 'underscore'],
                    exports: 'Backbone'
                },
                'jquery-migrate': ['jquery'],
                'jquery-ui': ['jquery'],
                'jquery.aop': ['jquery'],
                'jquery.hotkeys': ['jquery'],
                'jquery.moveto': ['jquery'],
                'tipsy': ['jquery'],
                'serializetoobject': ['jquery'],
                'jquery-select2': ['jquery'],
                'spin': ['jquery', 'aui/internal/spin'],

                // aui
                'aui': {
                    deps: ['jquery', 'jquery-migrate', 'polyfills/custom-event', 'aui/internal/deprecation'],
                    exports: 'AJS'
                },
                'aui-navigation': {
                    deps: ['aui', 'jquery', 'aui/internal/skate', 'aui/internal/widget'],
                    exports: 'AJS.navigation'
                },
                'aui/banner': ['jquery', 'template', 'aui', 'aui/internal/animation'],
                'blanket': ['aui', 'aui/internal/animation'],
                'aui/button': ['jquery', 'aui/internal/skate', 'aui/internal/spin', 'aui'],
                'aui-date-picker': ['aui', 'jquery.ui.datepicker', 'inline-dialog'],
                'jquery.ui.datepicker': ['jquery'],
                'dialog': ['aui', 'blanket', 'event'],
                'dialog2': {
                    deps: ['aui', 'jquery', 'layer', 'aui/internal/widget'],
                    exports: 'AJS.dialog2'
                },
                'dropdown': ['aui', 'jquery.aop'],
                'dropdown2': ['aui'],
                'event': ['aui'],
                'experimental-events/events': ['aui'],
                'firebug': ['aui'],
                'aui/flag': ['jquery', 'template', 'aui', 'aui/internal/animation'],
                'format': ['aui'],
                'forms': ['aui'],
                'aui/form-notification': ['jquery', 'aui/internal/skate', 'focus-manager', 'tipsy', 'forms', 'aui'],
                'aui/form-validation/validator-register': ['jquery', 'aui'],
                'aui/form-validation/basic-validators': ['aui', 'jquery', 'aui/form-validation/validator-register', 'format'],
                'aui/form-validation': ['jquery', 'aui/internal/skate', 'aui/form-validation/validator-register', 'aui/form-validation/basic-validators', 'aui/form-notification', 'forms', 'aui'],
                'focus-manager': ['aui'],
                'inline-dialog': ['aui'],
                'aui/inline-dialog2': ['aui/internal/alignment', 'layer', 'aui/internal/skate', 'aui/trigger', 'aui'],
                'aui/checkbox-multiselect': ['jquery', 'aui/internal/skate', 'aui-experimental-tooltip', 'dropdown2', 'whenitype'],
                'aui/internal/alignment': {
                    deps: ['aui/internal/tether', 'aui'],
                    exports: 'AJS.Alignment'
                },
                'aui/internal/animation': {
                    deps: ['aui'],
                    exports: 'AJS._internal.animation'
                },
                'aui/internal/browser': {
                    deps: ['jquery', 'aui'],
                    exports: 'AJS._internal.browser'
                },
                'aui/internal/deprecation': {
                    deps: ['jquery'],
                    exports: 'AJS.deprecate'
                },
                'aui/internal/widget': {
                    deps: ['aui', 'jquery'],
                    exports: 'AJS._internal.widget'
                },
                'keyCode': ['aui'],
                'layer': {
                    deps: ['aui', 'jquery', 'aui/internal/widget'],
                    exports: 'AJS.layer'
                },
                'layer-manager': {
                    deps: ['aui', 'blanket', 'layer', 'focus-manager'],
                    exports: 'AJS.LayerManager'
                },
                'layer-manager-global': {
                    deps: ['aui', 'keyCode', 'layer-manager'],
                    exports: 'AJS.LayerManager.global'
                },
                'messages': ['aui', 'template'],
                'aui-select2': ['aui', 'jquery-select2'],
                'aui-sidebar': ['aui', 'raf', 'modernizr-touch', 'aui/internal/widget', 'aui-navigation'],
                'aui-experimental-tables-sortable': ['aui', 'jquery.tablesorter'],
                'aui/internal/spin': {
                    exports: 'Spinner'
                },
                'tabs': ['aui'],
                'template': {
                    deps: ['aui'],
                    exports: 'AJS.template'
                },
                'toolbar': ['aui'],
                'aui/trigger': ['jquery', 'aui/internal/skate', 'aui'],
                'aui-experimental-tooltip': ['aui', 'jquery', 'tipsy'],
                'aui-experimental-progress-indicator': ['aui', 'aui/internal/animation'],
                'whenitype': ['aui', 'format', 'keyCode', 'dropdown', 'jquery.hotkeys', 'jquery.moveto'],
                'experimental-autocomplete/progressive-data-set': {
                    deps: ['aui', 'backbone'],
                    exports: 'AJS.ProgressiveDataSet'
                },
                'experimental-autocomplete/query-input': ['aui', 'backbone'],
                'experimental-autocomplete/query-result': ['aui', 'backbone'],
                'experimental-autocomplete/truncating-progressive-data-set': {
                    deps: ['aui', 'experimental-autocomplete/progressive-data-set'],
                    exports: 'AJS.TruncatingProgressiveDataSet'
                },
                'experimental-restfultable/restfultable': ['aui', 'backbone', 'experimental-events/events', 'format'],
                'experimental-restfultable/restfultable.entrymodel': ['aui', 'backbone', 'experimental-events/events', 'experimental-restfultable/restfultable'],
                'experimental-restfultable/restfultable.row': ['aui', 'backbone', 'experimental-restfultable/restfultable', 'soy/icons'],
                'experimental-restfultable/restfultable.editrow': ['aui', 'backbone', 'experimental-restfultable/restfultable', 'serializetoobject'],
                'experimental-restfultable/restfultable.customview': ['aui', 'backbone', 'experimental-restfultable/restfultable'],

                // restful table and its children have circular deps (restful table uses restfultable.*, restfultable.* requires
                // the restfultable namespace, so create a finaldep
                'experimental-restfultable/restfultable.all': ['experimental-restfultable/restfultable', 'experimental-restfultable/restfultable.entrymodel', 'experimental-restfultable/restfultable.row', 'experimental-restfultable/restfultable.editrow', 'experimental-restfultable/restfultable.customview'],

                // soy
                'soy/aui': ['soyutils'],
                'soy/avatar': ['soyutils', 'soy/aui'],
                'soy/badges': ['soyutils', 'soy/aui'],
                'soy/buttons': ['soyutils', 'soy/aui'],
                'soy/dialog2': ['soyutils', 'soy/aui'],
                'soy/dropdown': ['soyutils', 'soy/aui'],
                'soy/dropdown2': ['soyutils', 'soy/aui'],
                'soy/expander': ['soyutils', 'soy/aui'],
                'soy/form': ['soyutils', 'soy/aui'],
                'soy/group': ['soyutils', 'soy/aui'],
                'soy/icons': ['soyutils', 'soy/aui'],
                'soy/inline-dialog2': ['soyutils', 'soy/aui'],
                'soy/lozenges': ['soyutils', 'soy/aui'],
                'soy/labels': ['soyutils', 'soy/aui'],
                'soy/message': ['soyutils', 'soy/aui'],
                'soy/pane': ['soyutils', 'soy/aui'],
                'soy/panel': ['soyutils', 'soy/aui'],
                'soy/progress-tracker': ['soyutils', 'soy/aui'],
                'soy/table': ['soyutils', 'soy/aui'],
                'soy/tabs': ['soyutils', 'soy/aui'],
                'soy/toolbar': ['soyutils', 'soy/aui'],
                'soy/toolbar2': ['soyutils', 'soy/aui'],
                'soy/trigger': ['soyutils', 'soy/aui'],

                // test
                'aui-mocha': ['aui', 'polyfills/custom-event', 'layer-manager-global']
            }
        }
    };


    // The r.js optimiser doesn't use path fallbacks so we must detect which
    // version we are using and map it to that version.
    paths.jquery.some(function(path) {
        if (fs.existsSync('.' + config.options.baseUrl + '/' + path + '.js')) {
            paths.jquery = path;
            return true;
        }
    });


    module.exports = config;
}());
