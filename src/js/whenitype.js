
/**
 * A collection of common controls
 *
 * @module Controls
 * @requires AJS, jQuery
 */

/**
 * Keyboard commands with syntactic sugar.
 *
 * <strong>Usage:</strong>
 * <pre>
 * AJS.whenIType("gh").or("gd").goTo("/secure/Dashboard.jspa");
 * AJS.whenIType("c").click("#create_link");
 * </pre>
 *
 * @class whenIType
 * @constuctor whenIType
 * @namespace AJS
 * @param keys - Key combinations, modifier keys are "+" deliminated. e.g "ctrl+b"
 */

(function(exports, $) {
    'use strict';

    var isMac = navigator.platform.indexOf('Mac') !== -1;

    //see jquery.hotkeys.js for accepted names.
    var multiCharRegex = /^(backspace|tab|r(ight|eturn)|s(hift|pace|croll)|c(trl|apslock)|alt|pa(use|ge(up|down))|e(sc|nd)|home|left|up|d(el|own)|insert|f\d\d?|numlock|meta)/i;


    exports.whenIType = function (keys) {

        var boundKeyCombos = [],
            executor = $.Callbacks();

        function keypressHandler(e) {
            if (!AJS.popup.current  && executor) {
                executor.fire(e);
            }
        }
        function defaultPreventionHandler(e) {
            e.preventDefault();
        }

        // Bind an arbitrary set of keys by calling bindKeyCombo on each triggering key combo.
        // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
        function bindKeys(keys) {
            var keyCombos = keys && keys.split ? $.trim(keys).split(' ') : [ keys ];

            keyCombos.forEach(function(keyCombo) {
                bindKeyCombo(keyCombo);
            });
        }

        function hasUnprintables(keysArr) {
            // a bit of a heuristic, but works for everything we have. Only the unprintable characters are represented with > 1-character names.
            var i = keysArr.length;
            while(i--) {
                if (keysArr[i].length > 1 && keysArr[i] !== 'space') {
                    return true;
                }
            }
            return false;
        }

        // bind a single key combo to this handler
        // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
        function bindKeyCombo(keyCombo) {
            var keysArr = keyCombo instanceof Array ?
                      keyCombo :
                      keyComboArrayFromString(keyCombo.toString());

            var eventType = hasUnprintables(keysArr) ? 'keydown' : 'keypress';

            boundKeyCombos.push(keysArr);

            $(document).bind(eventType, keysArr, keypressHandler);

            // Override browser/plugins
            $(document).bind(eventType + ' keyup', keysArr, defaultPreventionHandler);
        }

        // parse out an array of (modifier+key) presses from a single string
        // e.g. "12ctrl+3" becomes [ "1", "2", "ctrl+3" ]
        function keyComboArrayFromString(keyString) {

            var keysArr = [],
                currModifiers = '';

            while(keyString.length) {
                var modifierMatch = keyString.match(/^(ctrl|meta|shift|alt)\+/i);
                var multiCharMatch = keyString.match(multiCharRegex);

                if (modifierMatch) {
                    currModifiers += modifierMatch[0];
                    keyString = keyString.substring(modifierMatch[0].length);

                } else if (multiCharMatch) {
                    keysArr.push(currModifiers + multiCharMatch[0]);
                    keyString = keyString.substring(multiCharMatch[0].length);
                    currModifiers = '';

                } else {
                    keysArr.push(currModifiers + keyString[0]);
                    keyString = keyString.substring(1);
                    currModifiers = '';
                }
            }

            return keysArr;
        }

        function addShortcutsToTitle(selector) {
            var elem = $(selector),
                title = elem.attr('title') || '',
                keyCombos = boundKeyCombos.slice();

            var shortcutInstructions = elem.data('kbShortcutAppended') || '';

            var isFirst = !shortcutInstructions;
            var originalTitle = isFirst? title : title.substring(0, title.length - shortcutInstructions.length);

            while(keyCombos.length) {
                shortcutInstructions = appendKeyComboInstructions(keyCombos.shift().slice(), shortcutInstructions, isFirst);
                isFirst = false;
            }

            if (isMac) {
                shortcutInstructions = shortcutInstructions
                    .replace(/Meta/ig, '\u2318') //Apple cmd key
                    .replace(/Shift/ig, '\u21E7'); //Apple Shift symbol
            }

            elem.attr('title', originalTitle + shortcutInstructions);
            elem.data('kbShortcutAppended', shortcutInstructions);
        }

        function removeShortcutsFromTitle(selector) {
            var elem = $(selector);
            var shortcuts = elem.data('kbShortcutAppended');

            if (!shortcuts) {
                return;
            }

            var title = elem.attr('title');
            elem.attr('title', title.replace(shortcuts, ''));
            elem.removeData('kbShortcutAppended');
        }

        //
        function appendKeyComboInstructions(keyCombo, title, isFirst) {
            if (isFirst) {
                title += ' (' + AJS.I18n.getText('aui.keyboard.shortcut.type.x', keyCombo.shift());
            } else {
                title = title.replace(/\)$/, '');
                title += AJS.I18n.getText('aui.keyboard.shortcut.or.x', keyCombo.shift());
            }

            keyCombo.forEach(function(key) {
                title += " " + AJS.I18n.getText("aui.keyboard.shortcut.then.x", key);
            });
            title += ')';

            return title;
        }

        bindKeys(keys);

        return exports.whenIType.makeShortcut({
            executor : executor,
            bindKeys : bindKeys,
            addShortcutsToTitle : addShortcutsToTitle,
            removeShortcutsFromTitle : removeShortcutsFromTitle,
            keypressHandler : keypressHandler,
            defaultPreventionHandler : defaultPreventionHandler
        });
    };

    exports.whenIType.makeShortcut = function(options) {

        var executor = options.executor;
        var bindKeys = options.bindKeys;
        var addShortcutsToTitle = options.addShortcutsToTitle;
        var removeShortcutsFromTitle = options.removeShortcutsFromTitle;
        var keypressHandler = options.keypressHandler;
        var defaultPreventionHandler = options.defaultPreventionHandler;

        var selectorsWithTitlesModified = [];

        function makeMoveToFunction(getNewFocus) {
            return function (selector, options) {
                options = options || {};
                var focusedClass = options.focusedClass || 'focused';
                var wrapAround = options.hasOwnProperty('wrapAround') ? options.wrapAround : true;
                var escToCancel = options.hasOwnProperty('escToCancel') ? options.escToCancel : true;

                executor.add(function () {

                    var $items = $(selector),
                        $focusedElem = $items.filter('.' + focusedClass),
                        moveToOptions = $focusedElem.length === 0 ? undefined : { transition : true };

                    if (escToCancel) {
                        $(document).one('keydown', function (e) {
                            if (e.keyCode === AJS.keyCode.ESCAPE && $focusedElem) {
                                $focusedElem.removeClass(focusedClass);
                            }
                        });
                    }

                    if ($focusedElem.length) {
                        $focusedElem.removeClass(focusedClass);
                    }

                    $focusedElem = getNewFocus($focusedElem, $items, wrapAround);

                    if ($focusedElem && $focusedElem.length > 0) {
                        $focusedElem.addClass(focusedClass);
                        $focusedElem.moveTo(moveToOptions);
                        if ($focusedElem.is('a')) {
                            $focusedElem.focus();
                        } else {
                            $focusedElem.find('a:first').focus();
                        }
                    }
                });
                return this;
            };
        }

        return {

            /**
             * Scrolls to and adds <em>focused</em> class to the next item in the jQuery collection
             *
             * @method moveToNextItem
             * @param selector
             * @param options
             * @return {Object}
             */
            moveToNextItem: makeMoveToFunction(function($focusedElem, $items, wrapAround) {
                var index;

                if (wrapAround && $focusedElem.length === 0) {
                    return $items.eq(0);

                } else {
                    index = $.inArray($focusedElem.get(0), $items);
                    if (index < $items.length-1) {
                        index = index +1;
                        return $items.eq(index);
                    } else if (wrapAround) {
                        return $items.eq(0);
                    }
                }

                return $focusedElem;
            }),
            /**
             * Scrolls to and adds <em>focused</em> class to the previous item in the jQuery collection
             *
             * @method moveToPrevItem
             * @param selector
             * @param focusedClass
             * @return {Object}
             */
            moveToPrevItem: makeMoveToFunction(function ($focusedElem, $items, wrapAround) {
                var index;
                if (wrapAround && $focusedElem.length === 0) {
                    return $items.filter(':last');

                } else {
                    index = $.inArray($focusedElem.get(0), $items);
                    if (index > 0) {
                        index = index -1;
                        return $items.eq(index);
                    } else if (wrapAround) {
                        return $items.filter(':last');
                    }
                }

                return $focusedElem;
            }),

            /**
             * Clicks the element specified by the <em>selector</em> argument.
             *
             * @method click
             * @param selector - jQuery selector for element
             * @return {Object}
             */
            click: function (selector) {
                selectorsWithTitlesModified.push(selector);
                addShortcutsToTitle(selector);

                executor.add(function () {
                    var elem = $(selector);
                    if (elem.length > 0) {
                        elem.click();
                    }
                });
                return this;
            },

            /**
             * Navigates to specified <em>location</em>
             *
             * @method goTo
             * @param {String} location - http location
             * @return {Object}
             */
            goTo: function (location) {
                executor.add(function () {
                    window.location.href = location;
                });
                return this;
            },

            /**
             * navigates browser window to link href
             *
             * @method followLink
             * @param selector - jQuery selector for element
             * @return {Object}
             */
            followLink: function (selector) {
                selectorsWithTitlesModified.push(selector);
                addShortcutsToTitle(selector);

                executor.add(function () {
                    var elem = $(selector)[0];
                    if (elem && { 'a' : true, 'link' : true }[ elem.nodeName.toLowerCase() ]) {
                        window.location.href = elem.href;
                    }
                });
                return this;
            },

            /**
             * Executes function
             *
             * @method execute
             * @param {function} func
             * @return {Object}
             */
            execute: function (func) {
                var self = this;
                executor.add(function () {
                    func.apply(self, arguments);
                });
                return this;
            },

            /**
             * @deprecated This implementation is uncool. Kept around to satisfy Confluence plugin devs in the short term.
             *
             * Executes the javascript provided by the shortcut plugin point _immediately_.
             *
             * @method evaluate
             * @param {Function} command - the function provided by the shortcut key plugin point
             */
            evaluate: function(command) {
                command.call(this);
            },

            /**
             * Scrolls to element if out of view, then clicks it.
             *
             * @method moveToAndClick
             * @param selector - jQuery selector for element
             * @return {Object}
             */
            moveToAndClick: function (selector) {
                selectorsWithTitlesModified.push(selector);
                addShortcutsToTitle(selector);

                executor.add(function () {
                    var elem = $(selector);
                    if (elem.length > 0) {
                        elem.click();
                        elem.moveTo();
                    }
                });
                return this;
            },

            /**
             * Scrolls to element if out of view, then focuses it
             *
             * @method moveToAndFocus
             * @param selector - jQuery selector for element
             * @return {Object}
             */
            moveToAndFocus: function (selector) {
                selectorsWithTitlesModified.push(selector);
                addShortcutsToTitle(selector);

                executor.add(function (e) {
                    var $elem = AJS.$(selector);
                    if ($elem.length > 0) {
                        $elem.focus();
                        if ($elem.moveTo) {
                            $elem.moveTo();
                        }
                        if ($elem.is(':input')) {
                            e.preventDefault();
                        }
                    }
                });
                return this;
            },

            /**
             * Binds additional keyboard controls
             *
             * @method or
             * @param {String} keys - keys to bind
             * @return {Object}
             */
            or: function (keys) {
                bindKeys(keys);
                return this;
            },

            /**
             * Unbinds shortcut keys
             *
             * @method unbind
             */
            unbind: function () {
                $(document)
                    .unbind('keydown keypress', keypressHandler)
                    .unbind('keydown keypress keyup', defaultPreventionHandler);

                for(var i = 0, len = selectorsWithTitlesModified.length; i < len; i++) {
                    removeShortcutsFromTitle(selectorsWithTitlesModified[i]);
                }
                selectorsWithTitlesModified = [];
            }
        };
    };

    /**
     * Creates keyboard commands and their actions from json data. Format looks like:
     *
     * <pre>
     * [
     *   {
     *        "keys":[["g", "d"]],
     *        "context":"global",
     *        "op":"followLink",
     *        "param":"#home_link"
     *    },
     *    {
     *        "keys":[["g", "i"]],
     *        "context":"global",
     *        "op":"followLink",
     *        "param":"#find_link"
     *    },
     *    {
     *        "keys":[["/"]],
     *        "context":"global",
     *        "op":"moveToAndFocus",
     *        "param":"#quickSearchInput"
     *    },
     *    {
     *        "keys":[["c"]],
     *        "context":"global",
     *        "op":"moveToAndClick",
     *        "param":"#create_link"
     *    }
     * ]
     * </pre>
     *
     * @method fromJSON
     * @static
     * @param json
     */
    exports.whenIType.fromJSON = function (json, switchCtrlToMetaOnMac) {
        var shortcuts = [];

        //AJS.keys is defined by the keyboard-shortcut plugin.
        if (json) {
            $.each(json, function (i,item) {
                var operation = item.op,
                    param = item.param,
                    params;

                if(operation === 'execute' || operation === 'evaluate') {
                    // need to turn function string into function object
                    params = [ new Function(param) ];

                } else if (/^\[[^\]\[]*,[^\]\[]*\]$/.test(param)) {
                    // pass in an array to send multiple params
                    try {
                        params = JSON.parse(param);
                    } catch(e) {
                        AJS.error('When using a parameter array, array must be in strict JSON format: ' + param);
                    }

                    if (!$.isArray(params)) {
                        AJS.error('Badly formatted shortcut parameter. String or JSON Array of parameters required: ' + param);
                    }

                } else {
                    params = [ param ];
                }

                $.each(item.keys, function () {

                    var shortcutList = this;
                    if (switchCtrlToMetaOnMac && isMac) {
                        shortcutList = $.map(shortcutList, function(shortcutString) {
                            return shortcutString.replace(/ctrl/i, "meta");
                        });
                    }

                    var newShortcut = AJS.whenIType(shortcutList);
                    newShortcut[operation].apply(newShortcut, params);
                    shortcuts.push(newShortcut);
                });
                
            });
        }

        return shortcuts;
    };

    // Trigger this event on an iframe if you want its keypress events to be propagated (Events to work in iframes).
    $(document).bind('iframeAppended', function (e, iframe) {
        $(iframe).load(function () {

            var target = $(iframe).contents();

            target.bind('keyup keydown keypress', function (e) {
                // safari propagates keypress events from iframes
                if ($.browser.safari && e.type === 'keypress') {
                    return;
                }
                if (!$(e.target).is(':input')) {

                    $.event.trigger(
                        e,
                        arguments, // Preserve original event data.
                        document,  // Bubble this event from the iframe's document to its parent document.
                        true       // Use the capturing phase to preserve original event.target.
                    );
                }
            });
        });
    });

})(AJS, AJS.$);