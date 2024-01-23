function jsVendorSource(file) {
    return '../js-vendor/' + file;
};

function auiRoot(file) {
    return '../../' + file;
}

var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        //disable/exclude sidebar tests because we want to remove sidebar eventually and it breaks the flatpack tests
        if (/-test\.js$/.test(file) && file !== '/base/tests/unit/sidebar/sidebar-test.js') {
            tests.push(file);
        }
    }
}
//Requirejs is not required by the flatpack so check if it's been loaded
// defined by require-config.js
var requireConfig = {};

requireConfig.baseUrl = '/base/src/js/';
requireConfig.deps = tests;
requireConfig.paths = {
    'aui': auiRoot('dist/aui-next/js/aui'),
    'aui-date-picker': auiRoot('dist/aui-next/js/aui-date-picker'),
    'aui-experimental': auiRoot('dist/aui-next/js/aui-experimental'),
    'aui-soy': auiRoot('dist/aui-next/js/aui-soy'),
    'aui-mocha': auiRoot('tests/unit/aui-mocha'),

    'underscore': jsVendorSource('underscorejs/underscore'),
    'backbone': jsVendorSource('backbone/backbone'),
    'serializetoobject': jsVendorSource('jquery/serializetoobject')
};
requireConfig.shim = {
    'aui': ['aui-soy'],
    'aui-date-picker': ['aui'],
    'aui-experimental': ['aui'],
    'aui-mocha': ['aui', 'polyfills/custom-event', 'layer-manager-global'],

    //progressive data set and restful table are not in flatpack so we need to include them manually so the tests run.
    'experimental-autocomplete/progressive-data-set': ['aui', 'backbone'],
    'experimental-autocomplete/query-input': ['aui', 'backbone'],
    'experimental-autocomplete/query-result': ['aui', 'backbone'],
    'experimental-autocomplete/truncating-progressive-data-set': ['aui', 'experimental-autocomplete/progressive-data-set'],
    'experimental-restfultable/restfultable': ['aui', 'backbone', 'experimental-events/events'],
    'experimental-restfultable/restfultable.entrymodel': ['aui', 'backbone', 'experimental-events/events', 'experimental-restfultable/restfultable'],
    'experimental-restfultable/restfultable.row': ['aui', 'backbone', 'experimental-restfultable/restfultable'],
    'experimental-restfultable/restfultable.editrow': ['aui', 'backbone', 'experimental-restfultable/restfultable', 'serializetoobject'],
    'experimental-restfultable/restfultable.customview': ['aui', 'backbone', 'experimental-restfultable/restfultable'],

    // restful table and its children have circular deps (restful table uses restfultable.*, restfultable.* requires
    // the restfultable namespace, so create a finaldep
    'experimental-restfultable/restfultable.all': ['experimental-restfultable/restfultable', 'experimental-restfultable/restfultable.entrymodel', 'experimental-restfultable/restfultable.row', 'experimental-restfultable/restfultable.editrow', 'experimental-restfultable/restfultable.customview'],
    'backbone': ['underscore'],
    'experimental-events/events': ['aui']
};


requireConfig.callback = window.__karma__.start;
requirejs.config(requireConfig);

var modules = [
    'soyutils',
    'soy/aui',
    'soy/avatar',
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
    'soy/checkbox-multiselect',
    'soy/labels',
    'soy/message',
    'soy/panel',
    'soy/progress-tracker',
    'soy/table',
    'soy/tabs',
    'soy/toolbar',
    'soy/toolbar2',
    'jquery.form',
    'jquery.aop',
    'jquery.ui.datepicker',
    'jquery-select2',
    'jquery.tablesorter',
    'jquery-compatibility',
    'aui/internal/spin',
    'jquery-ui',
    'jquery.os',
    'jquery.moveto',
    'aui/banner',
    'blanket',
    'aui/button',
    'event',
    'cookie',
    'dialog',
    'focus-manager',
    'layer-manager',
    'layer-manager-global',
    'keyCode',
    'layer',
    'dialog2',
    'dropdown',
    'dropdown2',
    'inline-dialog',
    'date-picker',
    'aui/flag',
    'format',
    'forms',
    'template',
    'messages',
    'aui-select2',
    'aui-sidebar',
    'tabs',
    'tables',
    'toolbar',
    'jquery.hotkeys',
    'whenitype',
    'aui/internal/widget',
    'aui/internal/browser',
    'aui-header-responsive',
    'aui-experimental-expander',
    'aui-experimental-tables-sortable',
    'aui-experimental-tooltip',
    'aui-experimental-progress-indicator'
]

for (var i in modules) {
    define(modules[i], ['aui', 'aui-date-picker', 'aui-experimental', 'aui-soy', 'experimental-autocomplete/progressive-data-set', 'experimental-restfultable/restfultable.all'], function() {});
}








