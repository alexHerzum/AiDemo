;(function(init) {
    'use strict';

    AJS._internal = AJS._internal || {};
    AJS._internal.widget = init(AJS.$);
})(function($) {
    'use strict';

    /**
     * @param {string} name The name of the widget to use in any messaging.
     * @param {function(new:{ $el: jQuery }, ?jQuery, ?Object)} Ctor
     *     A constructor which will only ever be called with "new". It must take a JQuery object as the first
     *     parameter, or generate one if not provided. The second parameter will be a configuration object.
     *     The returned object must have an $el property and a setOptions function.
     * @constructor
     */
    return function widget (name, Ctor) {
        var dataAttr = '_aui-widget-' + name;
        return function(selectorOrOptions, maybeOptions) {
            var selector;
            var options;
            if ($.isPlainObject(selectorOrOptions)) {
                options = selectorOrOptions;
            } else {
                selector = selectorOrOptions;
                options = maybeOptions;
            }

            var $el = selector && $(selector);

            var widget;
            if (!$el || !$el.data(dataAttr)) {
                widget = new Ctor($el, options || {});
                $el = widget.$el;
                $el.data(dataAttr, widget);
            } else {
                widget = $el.data(dataAttr);
                // options are discarded if $el has already been constructed
            }

            return widget;
        };
    };
});
