/**
 * Binds events to the window object. See jQuery bind documentation for more details.
 * <br>
 * Exceptions are caught and logged.
 *
 * @method bind
 * @namespace AJS
 * @for AJS
 */
AJS.bind = function (eventType, eventData, handler) {
    try {
        if (typeof handler === "function") {
            return AJS.$(window).bind(eventType, eventData, handler);
        } else {
            return AJS.$(window).bind(eventType, eventData);
        }
    } catch (e) {
        AJS.log("error while binding: " + e.message);
    }
};

/**
 * Unbinds event handlers from the window object. See jQuery unbind documentation for more details.
 * <br>
 * Exceptions are caught and logged.
 *
 * @method unbind
 * @namespace AJS
 * @for AJS
 */
AJS.unbind = function (eventType, handler) {
    try {
        return AJS.$(window).unbind(eventType, handler);
    } catch (e) {
        AJS.log("error while unbinding: " + e.message);
    }
};

/**
 * Triggers events on the window object. See jQuery trigger documentation for more details.
 * <br>
 * Exceptions are caught and logged.
 *
 * @method bind
 * @namespace AJS
 * @for AJS
 */
AJS.trigger = function(eventType, extraParameters) {
    try {
        return AJS.$(window).trigger(eventType, extraParameters);
    } catch (e) {
        AJS.log("error while triggering: " + e.message);
    }
};