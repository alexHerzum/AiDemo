;(function(init) {
    'use strict';

    define(function() {
        return init(AJS.$, window.skate);
    });
})(function ($, skate) {
    'use strict';


    function findControlled(trigger) {
        return document.getElementById(trigger.getAttribute('aria-controls'));
    }

    function triggerMessage(trigger, e) {
        if (trigger.isEnabled()) {
            var component = findControlled(trigger);
            if (component && component.message) {
                component.message(e);
            }
        }
    }


    skate('data-aui-trigger', {
        type: skate.types.ATTR,
        insert: function(trigger) {
            $(trigger).on({
                click: function(e) {
                    triggerMessage(trigger, e);
                    e.preventDefault();
                },
                'mouseenter mouseleave focus blur': function(e) {
                    triggerMessage(trigger, e);
                }
            });
        },
        prototype: {
            disable: function() {
                this.setAttribute('aria-disabled', 'true');
            },
            enable: function() {
                this.setAttribute('aria-disabled', 'false');
            },
            isEnabled: function() {
                return this.getAttribute('aria-disabled') !== 'true';
            }
        }
    });
});
