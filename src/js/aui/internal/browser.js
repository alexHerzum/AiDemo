;(function(init) {
    'use strict';

    AJS._internal = AJS._internal || {};
    AJS._internal.browser = init(AJS.$);
})(function($) {
    'use strict';

    var exports = {};

    var supportsCalc = null;

    exports.supportsCalc = function() {
        if (supportsCalc === null) {
            var $d = $('<div style="height: 10px; height: -webkit-calc(20px + 0); height: calc(20px);"></div>');
            supportsCalc = (20 === $d.appendTo(document.documentElement).height());
            $d.remove();
        }
        return supportsCalc;
    };

    exports.supportsRequestAnimationFrame = function() {
        return !!window.requestAnimationFrame;
    };

    return exports;
});
