;(function(init) {
    'use strict';

    AJS.layer = init(AJS.$, AJS._internal.widget);
})(function($, widget) {
    'use strict';


    var EVENT_PREFIX = '_aui-internal-layer-';
    var GLOBAL_EVENT_PREFIX = '_aui-internal-layer-global-';
    var LAYER_EVENT_PREFIX = 'aui-layer-';
    var $doc = $(document);


    function ariaHide ($el) {
        $el.attr('aria-hidden', 'true');
    }

    function ariaShow ($el) {
        $el.attr('aria-hidden', 'false');
    }

    function triggerEvent ($el, deprecatedName, newNativeName) {
        var e1 = $.Event(EVENT_PREFIX + deprecatedName);
        var e2 = $.Event(GLOBAL_EVENT_PREFIX + deprecatedName);
        var nativeEvent = new CustomEvent(LAYER_EVENT_PREFIX + newNativeName, {
            bubbles: true,
            cancelable: true
        });

        $el.trigger(e1);
        $el.trigger(e2, [$el]);
        $el[0].dispatchEvent(nativeEvent);

        return !e1.isDefaultPrevented() && !e2.isDefaultPrevented() && !nativeEvent.defaultPrevented;
    }


    function Layer (selector) {
        this.$el = $(selector || '<div class="aui-layer" aria-hidden="true"></div>');
        this.$el.addClass('aui-layer');
    }

    Layer.prototype = {
        /**
         * Returns the layer below the current layer if it exists.
         *
         * @returns {jQuery | undefined}
         */
        below: function () {
            return AJS.LayerManager.global.item(AJS.LayerManager.global.indexOf(this.$el) - 1);
        },

        /**
         * Returns the layer above the current layer if it exists.
         *
         * @returns {jQuery | undefined}
         */
        above: function () {
            return AJS.LayerManager.global.item(AJS.LayerManager.global.indexOf(this.$el) + 1);
        },

        changeSize: function (width, height) {
            this.$el.css('width', width);
            this.$el.css('height', height === 'content' ? '' : height);
            return this;
        },

        on: function (event, fn) {
            this.$el.on(EVENT_PREFIX + event, fn);
            return this;
        },

        off: function (event, fn) {
            this.$el.off(EVENT_PREFIX + event, fn);
            return this;
        },

        show: function () {
            if (this.isVisible()) {
                ariaShow(this.$el);
                return this;
            }

            if (triggerEvent(this.$el, 'beforeShow', 'show')) {
                AJS.LayerManager.global.push(this.$el);
            }

            return this;
        },

        hide: function () {
            if (!this.isVisible()) {
                ariaHide(this.$el);
                return this;
            }

            if (triggerEvent(this.$el, 'beforeHide', 'hide')) {
                AJS.LayerManager.global.popUntil(this.$el);
            }

            return this;
        },

        /**
         * Checks to see if the layer is visible.
         *
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.$el.attr('aria-hidden') === 'false';
        },

        remove: function () {
            this.hide();
            this.$el.remove();
            this.$el = null;
        },

        isBlanketed: function () {
            return this.$el.attr('data-aui-blanketed') === 'true';
        },

        /**
         * @returns {boolean} true if data-aui-persistent or data-aui-modal equal true. The modal check is for dialog2 backward compatability, and should be deprecated in the future
         */
        isPersistent: function () {
            return this.$el.attr('data-aui-persistent') === 'true' || this.$el.attr('data-aui-modal') === 'true';
        },

        _hideLayer: function (triggerBeforeEvents) {
            // inverse order to showLayer
            if (this.isPersistent() || this.isBlanketed()) {
                AJS.FocusManager.global.exit(this.$el);
            }

            if (triggerBeforeEvents) {
                triggerEvent(this.$el, 'beforeHide', 'hide');
            }

            this.$el.attr('aria-hidden', 'true');
            this.$el.css('z-index', this.$el.data('_aui-layer-cached-z-index') || '');
            this.$el.data('_aui-layer-cached-z-index', '');
            this.$el.trigger(EVENT_PREFIX + 'hide');
            this.$el.trigger(GLOBAL_EVENT_PREFIX + 'hide', [this.$el]);
        },

        _showLayer: function (zIndex) {
            if (!this.$el.parent().is('body')) {
                this.$el.appendTo(document.body);
            }

            // inverse order to hideLayer
            this.$el.data('_aui-layer-cached-z-index', this.$el.css('z-index'));
            this.$el.css('z-index', zIndex);
            this.$el.attr('aria-hidden', 'false');

            if (this.isPersistent() || this.isBlanketed()) {
                AJS.FocusManager.global.enter(this.$el);
            }

            this.$el.trigger(EVENT_PREFIX + 'show');
            this.$el.trigger(GLOBAL_EVENT_PREFIX + 'show', [this.$el]);
        }
    };

    var layerWidget = widget('layer', Layer);

    layerWidget.on = function (eventName, selector, fn) {
        $doc.on(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
        return this;
    };

    layerWidget.off = function (eventName, selector, fn) {
        $doc.off(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
        return this;
    };


    return layerWidget;
});
