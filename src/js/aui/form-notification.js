;(function(init) {
    'use strict';

    define(function () {
        return init(AJS.$, window.skate);
    });
})(function ($, skate) {
    'use strict';

    var NOTIFICATION_NAMESPACE = 'aui-form-notification';

    var ATTRIBUTE_TOOLTIP_POSITION = NOTIFICATION_NAMESPACE + '-position';

    var CLASS_NOTIFICATION_INITIALISED = '_aui-form-notification-initialised';

    var CLASS_NOTIFICATION_ICON = 'aui-icon-notification';

    var CLASS_TOOLTIP = NOTIFICATION_NAMESPACE + '-tooltip';
    var CLASS_TOOLTIP_ERROR = CLASS_TOOLTIP + '-error';
    var CLASS_TOOLTIP_INFO = CLASS_TOOLTIP + '-info';

    var ATTRIBUTE_NOTIFICATION_PREFIX = 'data-aui-notification-';
    var ATTRIBUTE_NOTIFICATION_WAIT = ATTRIBUTE_NOTIFICATION_PREFIX + 'wait';
    var ATTRIBUTE_NOTIFICATION_INFO = ATTRIBUTE_NOTIFICATION_PREFIX + 'info';
    var ATTRIBUTE_NOTIFICATION_ERROR = ATTRIBUTE_NOTIFICATION_PREFIX + 'error';
    var ATTRIBUTE_NOTIFICATION_SUCCESS = ATTRIBUTE_NOTIFICATION_PREFIX + 'success';

    var NOTIFICATION_PRIORITY = [
        ATTRIBUTE_NOTIFICATION_ERROR,
        ATTRIBUTE_NOTIFICATION_SUCCESS,
        ATTRIBUTE_NOTIFICATION_WAIT,
        ATTRIBUTE_NOTIFICATION_INFO
    ];

    var notificationFields = [];

    /* --- Tipsy configuration --- */
    var TIPSY_OPACITY = 1;
    var TIPSY_OFFSET_INSIDE_FIELD = 9; //offset in px from the icon to the start of the tipsy
    var TIPSY_OFFSET_OUTSIDE_FIELD = 3;

    function initialiseNotification($field) {
        if (!isFieldInitialised($field)) {
            prepareFieldMarkup($field);
            initialiseTooltip($field);
            bindFieldEvents($field);
        }

        notificationFields.push($field);
    }

    function isFieldInitialised($field) {
        return $field.hasClass(CLASS_NOTIFICATION_INITIALISED);
    }

    function constructFieldIcon(){
        return $('<span class="aui-icon aui-icon-small ' + CLASS_NOTIFICATION_ICON + '"/>');
    }

    function prepareFieldMarkup($field) {
        $field.addClass(CLASS_NOTIFICATION_INITIALISED);
        appendIconToField($field);
    }

    function appendIconToField($field) {
        var $icon = constructFieldIcon();
        $field.after($icon);
    }

    function initialiseTooltip($field) {
        getTooltipAnchor($field).tipsy({
            gravity: getTipsyGravity($field),
            title: function(){
                return getNotificationMessage($field);
            },
            trigger: 'manual',
            offset: canContainIcon($field) ? TIPSY_OFFSET_INSIDE_FIELD : TIPSY_OFFSET_OUTSIDE_FIELD,
            opacity: TIPSY_OPACITY,
            className: function() {
                return 'aui-form-notification-tooltip ' + getNotificationClass($field);
            },
            html: true
        });
    }

    // A list of HTML5 input types that don't typically get augmented by the browser, so are safe to put icons inside of.
    var unadornedInputFields = ['text', 'url', 'email', 'tel', 'password'];

    function canContainIcon($field) {
        return unadornedInputFields.indexOf($field.attr('type')) !== -1;
    }

    function getNotificationMessage($field) {
        var notificationType = getFieldNotificationType($field);
        var message = notificationType ? $field.attr(notificationType) : '';
        return formatMessage(message);
    }

    function formatMessage(message) {
        if (message === '') {
            return message;
        }

        var messageArray = jsonToArray(message);

        if (messageArray.length === 1) {
            return messageArray[0];
        } else {
            return '<ul><li>'+messageArray.join('</li><li>')+'</li></ul>';
        }
    }

    function jsonToArray(jsonOrString) {
        var jsonArray;
        try {
            jsonArray = JSON.parse(jsonOrString);
        } catch (exception) {
            jsonArray = [jsonOrString];
        }
        return jsonArray;
    }

    function getNotificationClass($field) {
        var notificationType = getFieldNotificationType($field);

        if (notificationType === ATTRIBUTE_NOTIFICATION_ERROR) {
            return CLASS_TOOLTIP_ERROR;
        } else if (notificationType === ATTRIBUTE_NOTIFICATION_INFO) {
            return CLASS_TOOLTIP_INFO;
        }
    }

    function getFieldNotificationType($field) {
        var fieldNotificationType;
        NOTIFICATION_PRIORITY.some(function(prioritisedNotification) {
            if ($field.is('[' + prioritisedNotification + ']')) {
                fieldNotificationType = prioritisedNotification;
                return true;
            }
        });

        return fieldNotificationType;
    }

    function bindFieldEvents($field) {
        if (focusTogglesTooltip($field)) {
            bindFieldTabEvents($field);
        }
    }

    function focusTogglesTooltip($field) {
        return $field.is(':aui-focusable');
    }

    function fieldHasTooltip($field) {
        return getNotificationMessage($field) !== '';
    }

    function showTooltip($field) {
        getTooltipAnchor($field).tipsy('show');
        if (focusTogglesTooltip($field)) {
            bindTooltipTabEvents($field);
        }
    }

    function hideTooltip($field) {
        getTooltipAnchor($field).tipsy('hide');
    }

    function bindFocusTooltipInteractions() {
        document.addEventListener('focus', function(e) {
            notificationFields.forEach(function(field) {
                var $field = $(field);
                var $tooltip = getTooltip($field);

                if (!$tooltip || !focusTogglesTooltip($field)) {
                    return;
                }

                var isFocusInTooltip = $.contains($tooltip[0], e.target);
                var isFocusTargetField = $field.is(e.target);

                if (isFocusTargetField) {
                    showTooltip($field);
                } else if (!isFocusInTooltip) {
                    hideTooltip($field);
                }
            });
        }, true);
    }

    bindFocusTooltipInteractions();

    function bindFieldTabEvents($field) {
        $field.on('keydown', function(e) {
            if (isNormalTab(e) && fieldHasTooltip($field)) {
                var $firstTooltipLink = getFirstTooltipLink($field);
                if ($firstTooltipLink.length) {
                    $firstTooltipLink.focus();
                    e.preventDefault();
                }
            }
        });
    }

    function isNormalTab(e) {
        return e.keyCode === AJS.keyCode.TAB && !e.shiftKey && !e.altKey;
    }

    function isShiftTab(e) {
        return e.keyCode === AJS.keyCode.TAB && e.shiftKey;
    }

    function getFirstTooltipLink($field) {
        return getTooltip($field).find(':aui-tabbable').first();
    }

    function getLastTooltipLink($field) {
        return getTooltip($field).find(':aui-tabbable').last();
    }

    function getTooltip($field) {
        var $anchor = getTooltipAnchor($field);
        if ($anchor.data('tipsy')) {
            return $anchor.data('tipsy').$tip;
        }
    }

    function bindTooltipTabEvents($field) {
        var $tooltip = getTooltip($field);
        $tooltip.on('keydown', function(e) {
            var leavingTooltipForwards = elementIsActive(getLastTooltipLink($field));
            var leavingTooltipBackwards = elementIsActive(getFirstTooltipLink($field));

            if (isNormalTab(e) && leavingTooltipForwards) {
                if (leavingTooltipForwards) {
                    $field.focus();
                }
            }
            if (isShiftTab(e) && leavingTooltipBackwards) {
                if (leavingTooltipBackwards) {
                    $field.focus();
                    e.preventDefault();
                }
            }
        });
    }

    function getTipsyGravity($field) {
        var position = $field.data(ATTRIBUTE_TOOLTIP_POSITION) || 'side';
        var gravityMap = {
            side: 'w',
            top: 'se',
            bottom: 'ne'
        };
        var gravity = gravityMap[position];
        if (!gravity) {
            gravity = 'w';
            console.warn('Invalid notification position: "' + position + '". Valid options are "side", "bottom, "top"');
        }
        return gravity;
    }

    function getTooltipAnchor($field) {
        return getFieldIcon($field);
    }

    function getFieldIcon($field) {
        return $field.next('.' + CLASS_NOTIFICATION_ICON);
    }

    function elementIsActive($el) {
        var el = ($el instanceof $) ? $el[0]: $el;
        return el && el === document.activeElement;
    }

    function synchroniseNotificationDisplay($field) {
        $field = ($field instanceof $) ? $field : $($field);
        var notificationType = getFieldNotificationType($field);

        var showSpinner = notificationType === ATTRIBUTE_NOTIFICATION_WAIT;
        setFieldSpinner($field, showSpinner);
        var noNotificationOnField = !notificationType;
        if (noNotificationOnField) {
            hideTooltip($field);
            return;
        }

        var message = getNotificationMessage($field);

        var tooltipShouldBeVisible = (elementIsActive($field) || !canContainIcon($field));
        if (tooltipShouldBeVisible && message) {
            showTooltip($field);
        } else {
            hideTooltip($field);
        }
    }

    function setFieldSpinner($field, isSpinnerVisible) {
        if (isSpinnerVisible) {
            getFieldIcon($field).addClass('aui-icon-wait');
        } else {
            getFieldIcon($field).removeClass('aui-icon-wait');
        }
    }

    skate('data-aui-notification-field', {
        insert: function(element) {
            initialiseNotification($(element));
        },
        attributes: (function() {
            var attrs = {};
            NOTIFICATION_PRIORITY.forEach(function(type) {
                attrs[type] = synchroniseNotificationDisplay;
            });
            return attrs;
        }()),
        type: skate.types.ATTR
    });
});
