AJS.FocusManager = (function($) {

    (function initSelectors() {
        /*
         :tabbable and :focusable functions from jQuery UI v 1.10.4
         renamed to :aui-tabbable and :aui-focusable to not clash with jquery-ui if it's included.
         Code modified slightly to be compatible with jQuery < 1.8
            .addBack() replaced with .andSelf()
            $.curCSS() replaced with $.css()

         */
        function visible( element ) {
            return !$( element ).parents().andSelf().filter(function() {
                return $.css( this, "visibility" ) === "hidden" ||
                    $.expr.filters.hidden( this );
            }).length;
        }

        function focusable( element, isTabIndexNotNaN ) {
            var nodeName = element.nodeName.toLowerCase();

            if (nodeName === 'area') {
                var map = element.parentNode;
                var mapName = map.name;
                var imageMap = $('img[usemap=#' + mapName + ']').get();

                if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
                    return false;
                }
                return imageMap && visible(imageMap);
            }
            var isFormElement = /input|select|textarea|button|object/.test(nodeName);
            var isAnchor = nodeName === 'a';
            var isAnchorTabbable = (element.href || isTabIndexNotNaN);

            return (
                isFormElement ? !element.disabled :
                    (isAnchor ? isAnchorTabbable : isTabIndexNotNaN)
                ) && visible(element);
        }

        function tabbable( element ){
            var tabIndex = $.attr( element, "tabindex" ),
                isTabIndexNaN = isNaN( tabIndex );
            var hasTabIndex = ( isTabIndexNaN || tabIndex >= 0 );

            return hasTabIndex && focusable( element, !isTabIndexNaN );
        }

        $.extend( $.expr[ ":" ], {
            'aui-focusable': function( element ) {
                return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
            },

            'aui-tabbable': tabbable
        });
    }());

    var RESTORE_FOCUS_DATA_KEY = "_aui-focus-restore";
    function FocusManager() {
        this._focusTrapStack = [];
        $(document).on('focusout', {focusTrapStack: this._focusTrapStack},  focusTrapHandler);
    }
    FocusManager.defaultFocusSelector = ":aui-tabbable";
    FocusManager.prototype.enter = function($el) {
        // remember focus on old element
        $el.data(RESTORE_FOCUS_DATA_KEY, $(document.activeElement));

        // focus on new selector
        if ($el.attr("data-aui-focus") !== "false") {
            var focusSelector = $el.attr('data-aui-focus-selector') || FocusManager.defaultFocusSelector;
            var $focusEl = $el.is(focusSelector) ? $el : $el.find(focusSelector);
            $focusEl.first().focus();
        }

        if (elementTrapsFocus($el)) {
            trapFocus($el, this._focusTrapStack);
        }
    };

    function trapFocus($el, focusTrapStack) {
        focusTrapStack.push($el);
    }

    function untrapFocus(focusTrapStack) {
        focusTrapStack.pop();
    }

    function elementTrapsFocus($el) {
        return $el.is('.aui-dialog2');
    }

    FocusManager.prototype.exit = function($el) {
        if (elementTrapsFocus($el)) {
            untrapFocus(this._focusTrapStack);
        }

        // AUI-1059: remove focus from the active element when dialog is hidden
        var activeElement = document.activeElement;
        if ($el[0] === activeElement || $el.has(activeElement).length) {
            $(activeElement).blur();
        }

        var $restoreFocus = $el.data(RESTORE_FOCUS_DATA_KEY);
        if ($restoreFocus && $restoreFocus.length) {
            $el.removeData(RESTORE_FOCUS_DATA_KEY);
            $restoreFocus.focus();
        }
    };

    function focusTrapHandler(event) {
        var focusTrapStack = event.data.focusTrapStack;

        if (!event.relatedTarget) { //Does not work in firefox, see https://bugzilla.mozilla.org/show_bug.cgi?id=687787
            return;
        }

        if (focusTrapStack.length === 0) {
            return;
        }

        var $focusTrapElement = focusTrapStack[focusTrapStack.length - 1];

        var focusOrigin = event.target;
        var focusTo = event.relatedTarget;

        var $tabbableElements = $focusTrapElement.find(':aui-tabbable');
        var $firstTabbableElement = AJS.$($tabbableElements.first());
        var $lastTabbableElement = AJS.$($tabbableElements.last());

        var elementContainsOrigin = $focusTrapElement.has(focusTo).length === 0;
        var focusLeavingElement = elementContainsOrigin && focusTo;
        if (focusLeavingElement) {
            if ($firstTabbableElement.is(focusOrigin)) {
                $lastTabbableElement.focus();
            } else if ($lastTabbableElement.is(focusOrigin)) {
                $firstTabbableElement.focus();
            }
        }

    }

    FocusManager.global = new FocusManager();

    return FocusManager;
}(AJS.$));