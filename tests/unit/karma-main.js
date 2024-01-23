var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/-test\.js$/.test(file)) {
            tests.push(file);
        }
    }
}
//Requirejs is not required by the flatpack so check if it's been loaded
// defined by require-config.js
var requireConfig = window.requireConfig;

requireConfig.baseUrl = '/base' + requireConfig.baseUrl;
requireConfig.deps = tests;
requireConfig.callback = window.__karma__.start;
requirejs.config(requireConfig);
