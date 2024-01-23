window.AJS = window.AJS || {};
window.AJS.deprecate = {};

(function ($, exports) {
    'use strict';

    var has = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;

    function toSentenceCase (str) {
        str += '';
        if (!str) {
            return '';
        }
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    var deprecationCalls = [];

    /**
     * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
     * It will also print the stack frame of the calling function.
     *
     * @param {string} displayName the name of the thing being deprecated
     * @param {object} options
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.alternativeName the name of an alternative to use
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     * @return {Function} that logs the warning and stack frame of the calling function. Takes in an optional parameter for the offset of
     * the stack frame to print, the default is 0. For example, 0 will log it for the line of the calling function,
     * -1 will print the location the logger was called from
     */
    function getShowDeprecationMessage(displayName, options) {
        // This can be used internally to pas in a showmessage fn
        if (typeof displayName === 'function') {
            return displayName;
        }
        var called = false;
        options = options || {};

        return function(printFrameOffset) {
            var deprecatedLocation = exports.__getDeprecatedLocation(printFrameOffset ? printFrameOffset : 1) || '';
            // Only log once if the stack frame doesn't exist to avoid spamming the console/test output
            if (!called || deprecationCalls.indexOf(deprecatedLocation) === -1) {
                called = true;

                var message = 'DEPRECATED - ' + toSentenceCase(displayName) +
                    ' has been deprecated' + (options.sinceVersion ? ' since ' + options.sinceVersion : '') +
                    ' and will be removed in ' + (options.removeInVersion || 'a future release') + '.';

                if (options.alternativeName) {
                    message += ' Use ' + options.alternativeName + ' instead. ';
                }
                if (options.extraInfo) {
                    message += ' ' + options.extraInfo;
                }

                if (deprecatedLocation === '') {
                    exports.__logger(message + ' \n ' + 'No stack trace of the deprecated usage is available in your current browser.');
                } else {
                    exports.__logger(message + ' \n ' + deprecatedLocation);
                }
                deprecationCalls.push(deprecatedLocation);
            }
        };
    }

    exports.__logger = function() {
        // TODO AUI-2700 - use console.warn
        return console.log.apply(console, arguments);
    };

    exports.__getDeprecatedLocation = function (printFrameOffset) {
        var err = new Error();
        var stack = err.stack || err.stacktrace;
        var stackMessage = (stack && stack.replace(/^Error\n/, '')) || '';

        if (stackMessage) {
            stackMessage = stackMessage.split('\n');
            return stackMessage[printFrameOffset + 2];
        }
        return stackMessage;
    };

    /**
     * Returns a wrapped version of the function that logs a deprecation warning when the function is used.
     * @param {Function} fn the fn to wrap
     * @param {string} displayName the name of the fn to be displayed in the message
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.alternativeName the name of an alternative to use
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     * @return {Function} wrapping the original function
     */
    function deprecateFunctionExpression(fn, displayName, options) {
        var showDeprecationMessage = getShowDeprecationMessage(displayName || fn.name || 'this function', options);
        return function() {
            showDeprecationMessage();
            return fn.apply(this, arguments);
        };
    }

    /**
     * Returns a wrapped version of the constructor that logs a deprecation warning when the constructor is instantiated.
     * @param {Function} constructorFn the constructor function to wrap
     * @param {string} displayName the name of the fn to be displayed in the message
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.alternativeName the name of an alternative to use
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     * @return {Function} wrapping the original function
     */
    function deprecateConstructor(constructorFn, displayName, options) {
        var deprecatedConstructor = deprecateFunctionExpression(constructorFn, displayName, options);
        deprecatedConstructor.prototype = constructorFn.prototype;
        $.extend(deprecatedConstructor, constructorFn); //copy static methods across;

        return deprecatedConstructor;
    }


    var supportsProperties = false;
    try {
        if (Object.defineProperty) {
            Object.defineProperty({}, 'blam', { get : function() {}, set: function() {} });
            supportsProperties = true;
        }
    } catch(e) {
        /* IE8 doesn't support on non-DOM elements */
    }

    /**
     * Wraps a "value" object property in a deprecation warning in browsers supporting Object.defineProperty
     * @param {Object} obj the object containing the property
     * @param {string} prop the name of the property to deprecate
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
     * @param {string} options.alternativeName the name of an alternative to use
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     */
    function deprecateValueProperty(obj, prop, options) {
        if (supportsProperties) {
            var oldVal = obj[prop];
            options = options || {};
            var displayNameOrShowMessageFn = options.displayName || prop;
            var showDeprecationMessage = getShowDeprecationMessage(displayNameOrShowMessageFn, options);
            Object.defineProperty(obj, prop, {
                get : function () {
                    showDeprecationMessage();
                    return oldVal;
                },
                set : function(val) {
                    oldVal = val;
                    showDeprecationMessage();
                    return val;
                }
            });
        } else {
            // Browser doesn't support properties, so we can't hook in to show the deprecation warning.
        }
    }

    /**
     * Wraps an object property in a deprecation warning, if possible. functions will always log warnings, but other
     * types of properties will only log in browsers supporting Object.defineProperty
     * @param {Object} obj the object containing the property
     * @param {string} prop the name of the property to deprecate
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
     * @param {string} options.alternativeName the name of an alternative to use
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     */
    function deprecateObjectProperty(obj, prop, options) {
        if (typeof obj[prop] === 'function') {
            options = options || {};
            var displayNameOrShowMessageFn = options.displayName || prop;
            obj[prop] = deprecateFunctionExpression(obj[prop], displayNameOrShowMessageFn, options);
        } else {
            deprecateValueProperty(obj, prop, options);
        }
    }

    /**
     * Wraps all an objects properties in a deprecation warning, if possible. functions will always log warnings, but other
     * types of properties will only log in browsers supporting Object.defineProperty
     * @param {Object} obj the object to be wrapped
     * @param {string} objDisplayPrefix the object's prefix to be used in logs
     * @param {string} options.removeInVersion the version this will be removed in
     * @param {string} options.alternativeNamePrefix the name of another object to prefix the deprecated objects properties with
     * @param {string} options.sinceVersion the version this has been deprecated since
     * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
     */
    function deprecateAllProperties(obj, objDisplayPrefix, options) {
        options = options || {};
        for(var attr in obj) {
            if (has.call(obj, attr)) {
                options.displayName = objDisplayPrefix + attr;
                options.alternativeName = options.alternativeNamePrefix && (options.alternativeNamePrefix + attr);
                deprecateObjectProperty(obj, attr, $.extend({}, options));
            }
        }
    }

    exports.fn = deprecateFunctionExpression;
    exports.construct = deprecateConstructor;
    exports.prop = deprecateObjectProperty;
    exports.obj = deprecateAllProperties;
    exports.propertyDeprecationSupported = supportsProperties;
    exports.getMessageLogger = getShowDeprecationMessage;

})(jQuery || Zepto, window.AJS.deprecate);
