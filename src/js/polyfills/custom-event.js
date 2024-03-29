(function() {
    'use strict';

    if (window.CustomEvent) {
        // Some browsers don't support constructable custom events yet.
        try {
            new CustomEvent();
        } catch (e) {
            return;
        }
    }

    /**
     * @type CustomEvent
     * @param {String} event - the name of the event.
     * @param {Object} [params] - optional configuration of the custom event.
     * @param {Boolean} [params.cancelable=false] - A boolean indicating whether the event is cancelable (i.e., can call preventDefault and set the defaultPrevented property).
     * @param {Boolean} [params.bubbles=false] - A boolean indicating whether the event bubbles up through the DOM or not.
     * @param {Boolean} [params.detail] - The data passed when initializing the event.
     * @extends Event
     * @returns {Event}
     * @constructor
     */
    function CustomEvent (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };

        var evt = document.createEvent('CustomEvent');

        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;

}());
