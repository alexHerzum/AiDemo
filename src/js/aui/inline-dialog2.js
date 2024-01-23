;(function(init) {
    'use strict';

    define(['./internal/alignment', './trigger'], function(Alignment) {
        return init(Alignment, AJS.layer, window.skate);
    });
})(function(Alignment, Layer, skate) {
    'use strict';


    var DEFAULT_HOVEROUT_DELAY = 1000;


    function getTrigger (element) {
        return document.querySelector('[aria-controls="' + element.id + '"]');
    }

    function doIfTrigger (element, callback) {
        var trigger = getTrigger(element);

        if (trigger) {
            callback(trigger);
        }
    }

    function doIfHover (element, callback) {
        var isHover = element.getAttribute('data-aui-responds-to') === 'hover';
        if (isHover) {
            callback(element);
        }
    }

    function initAlignment (element, trigger) {
        if (!element._auiAlignment) {
            element._auiAlignment = new Alignment(element, trigger);
        }
    }

    function enableAlignment (element, trigger) {
        initAlignment(element, trigger);
        element._auiAlignment.enable();
    }

    function disableAlignment (element, trigger) {
        initAlignment(element, trigger);
        element._auiAlignment.disable();
    }


    skate('aui-inline-dialog2', {
        type: skate.types.CLASS,

        ready: function(element) {
            doIfTrigger(element, function (trigger) {
                trigger.setAttribute('aria-expanded', element.isVisible());
                trigger.setAttribute('aria-haspopup', 'true');
            });

            doIfHover(element, function () {
                element.mouseInside = false;

                element.addEventListener('mouseenter', function () {
                    element.mouseInside = true;
                    element.message({type: 'mouseenter'});
                });
                element.addEventListener('mouseleave', function () {
                    element.mouseInside = false;
                    element.message({type: 'mouseleave'});
                });
            });
        },

        remove: function (element) {
            if (element._auiAlignment) {
                element._auiAlignment.destroy();
            }
        },

        prototype: {
            /**
             * Removes the inline dialog after hiding and removing it from the layer stack.
             *
             * @returns {undefined}
             */
            remove: function() {
                Layer(this).remove();
            },

            /**
             * Shows the inline dialog.
             *
             * @returns {HTMLElement}
             */
            show: function() {
                var that = this;

                Layer(this).show();

                doIfTrigger(this, function (trigger) {
                    enableAlignment(that, trigger);
                    trigger.setAttribute('aria-expanded', 'true');
                });

                return this;
            },

            /**
             * Hides the inline dialog.
             *
             * @returns {HTMLElement}
             */
            hide: function() {
                var that = this;

                Layer(this).hide();

                doIfTrigger(this, function (trigger) {
                    disableAlignment(that, trigger);
                    trigger.setAttribute('aria-expanded', 'false');
                });

                return this;
            },

            /**
             * Returns whether or not the inline dialog is visible.
             *
             * @returns {HTMLElement}
             */
            isVisible: function() {
                return Layer(this).isVisible();
            },

            /**
             * Handles the receiving of a message from another component.
             *
             * @param {Object} message The message to act on.
             *
             * @returns {HTMLElement}
             */
            message: function(message) {
                handleMessage(this, message);
                return this;
            }
        }
    });

    function handleMessage (inlineDialog, message) {
        var messageTypeMap = {
            toggle: ['click'],
            hover: ['mouseenter', 'mouseleave', 'focus', 'blur']
        };
        var respondsTo = inlineDialog.getAttribute('data-aui-responds-to');
        var messageList = messageTypeMap[respondsTo];

        if (messageList && messageList.indexOf(message.type) > -1) {
            messageHandler[message.type](inlineDialog, message);
        }
    }

    var messageHandler = {
        click: function (inlineDialog) {
            if (inlineDialog.isVisible()) {
                if (!Layer(inlineDialog).isPersistent()) {
                    inlineDialog.hide();
                }
            } else {
                inlineDialog.show();
            }
        },

        mouseenter: function (inlineDialog) {
            if (!inlineDialog.isVisible()) {
                inlineDialog.show();
            }

            if (inlineDialog._clearMouseleaveTimeout) {
                inlineDialog._clearMouseleaveTimeout();
            }
        },

        mouseleave: function (inlineDialog) {
            if (Layer(inlineDialog).isPersistent() || !inlineDialog.isVisible()) {
                return;
            }

            if (inlineDialog._clearMouseleaveTimeout) {
                inlineDialog._clearMouseleaveTimeout();
            }

            var timeout = setTimeout(function () {
                if (!inlineDialog.mouseInside) {
                    inlineDialog.hide();
                }
            }, DEFAULT_HOVEROUT_DELAY);

            inlineDialog._clearMouseleaveTimeout = function () {
                clearTimeout(timeout);
                inlineDialog._clearMouseleaveTimeout = null;
            };
        },

        focus: function (inlineDialog) {
            if (!inlineDialog.isVisible()) {
                inlineDialog.show();
            }
        },

        blur: function (inlineDialog) {
            if (!Layer(inlineDialog).isPersistent() && inlineDialog.isVisible()) {
                inlineDialog.hide();
            }
        }
    };
});
