;(function(init) {
    'use strict';

    AJS.dialog2 = init(AJS.$, AJS.layer, AJS._internal.widget);
})(function($, layerWidget, widget) {
    'use strict';


    var defaults = {
        'aui-focus': 'false', // do not focus by default as it's overridden below
        'aui-blanketed': 'true'
    };

    function applyDefaults($el) {
        $.each(defaults, function(key, value) {
            var dataKey = 'data-' + key;
            if (!$el[0].hasAttribute(dataKey)) {
                $el.attr(dataKey, value);
            }
        });
    }

    function Dialog2(selector) {
        if (selector) {
            this.$el = $(selector);
        }
        else {
            this.$el = $(aui.dialog.dialog2({}));
        }
        applyDefaults(this.$el);
    }

    Dialog2.prototype.on = function(event, fn) {
        layerWidget(this.$el).on(event, fn);
        return this;
    };

    Dialog2.prototype.off = function(event, fn) {
        layerWidget(this.$el).off(event, fn);
        return this;
    };

    Dialog2.prototype.show = function() {
        layerWidget(this.$el).show();
        return this;
    };

    Dialog2.prototype.hide = function() {
        layerWidget(this.$el).hide();
        return this;
    };

    Dialog2.prototype.remove = function() {
        layerWidget(this.$el).remove();
        return this;
    };

    Dialog2.prototype.isVisible = function() {
        return layerWidget(this.$el).isVisible();
    };

    var dialog2Widget = widget('dialog2', Dialog2);

    dialog2Widget.on = function(eventName, fn) {
        layerWidget.on(eventName, '.aui-dialog2', fn);
        return this;
    };

    dialog2Widget.off = function(eventName, fn) {
        layerWidget.off(eventName, '.aui-dialog2', fn);
        return this;
    };

    /* Live events */

    $(document).on('click', '.aui-dialog2-header-close', function(e) {
        e.preventDefault();
        dialog2Widget($(this).closest('.aui-dialog2')).hide();
    });

    dialog2Widget.on('show', function(e, $el) {
        var selectors = ['.aui-dialog2-content', '.aui-dialog2-footer', '.aui-dialog2-header'];
        var $selected;
        selectors.some(function(selector) {
            $selected = $el.find(selector + ' :aui-tabbable');
            return $selected.length;
        });
        $selected && $selected.first().focus();
    });

    dialog2Widget.on('hide', function(e,$el) {
        var layer = layerWidget($el);

        if ($el.data('aui-remove-on-hide')) {
            layer.remove();
        }
    });

    return dialog2Widget;
});
