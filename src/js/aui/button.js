define(['aui/internal/spin'], function (Spinner) {
    'use strict';

    /*
     Can't depend on jQuery or skate since they won't be defined in product environments (thanks to deletion of the define.amd object)
     */
    var $ = AJS.$;
    var skate = window.skate;

    function createSpinner(button) {
        var $button = $(button);
        var spinContainer = document.createElement('div');
        var $spinContainer = $(spinContainer);
        $spinContainer.addClass('aui-button-spinner');

        var presets = {color: $button.css('color'), lines: 12, length: 3, width: 2, radius: 3, trail: 60, speed: 1.5};
        $spinContainer.data().spinner = new Spinner(presets).spin(spinContainer);

        $button.append(spinContainer);
    }

    function removeSpinner(button) {
        var $button = $(button);
        var $spinContainer = $button.children('.aui-button-spinner').first();

        var data = $spinContainer.data();
        data.spinner.stop();
        delete data.spinner;

        $spinContainer.remove();
    }

    function isBusy(button) {
        var ariaBusy = button.getAttribute('aria-busy');
        return ariaBusy && ariaBusy === 'true';
    }

    function isInputNode(button) {
        return button.nodeName === 'INPUT';
    }

    skate('aui-button', {
        type: skate.types.CLASS,

        ready: function(element) {
            if (!element.hasAttribute('aria-busy')) {
                element.setAttribute('aria-busy', false);
            }
        },

        prototype: {
            /**
             * Adds a spinner to the button and hides the text
             *
             * @returns {HTMLElement}
             */
            busy: function() {
                if (isInputNode(this) || isBusy(this)) {
                    console.warn('It is not valid to call busy() on an input button.');
                    return this;
                }

                createSpinner(this);
                this.setAttribute('aria-busy', true);

                return this;
            },

            /**
             * Removes the spinner and shows the tick on the button
             *
             * @returns {HTMLElement}
             */
            idle: function() {
                if (isInputNode(this) || !isBusy(this)) {
                    console.warn('It is not valid to call idle() on an input button.');
                    return this;
                }

                removeSpinner(this);
                this.setAttribute('aria-busy', false);

                return this;
            },

            /**
             * Removes the spinner and shows the tick on the button
             *
             * @returns {Boolean}
             */
            isBusy: function() {
                if (isInputNode(this)) {
                    console.warn('It is not valid to call isBusy() on an input button.');
                    return false;
                }

                return isBusy(this);
            }
        }
    });
});
