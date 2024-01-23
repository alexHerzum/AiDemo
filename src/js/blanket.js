(function($) {
    
    var $overflowEl;

    /**
     *
     * Dims the screen using a blanket div
     * @param useShim deprecated, it is calculated by dim() now
     */
    AJS.dim = function (useShim, zIndex) {

        var pruneOldBlanket = (AJS.dim.$dim && (AJS.dim.$dim.attr('aria-hidden') === 'true'));
        if (pruneOldBlanket) {
            AJS.dim.$dim.remove();
            AJS.dim.$dim = null;
        }

        if  (!$overflowEl) {
            $overflowEl = $(document.body);
        }

        if (useShim === true) {
            useShimDeprecationLogger();
        }

        if (!AJS.dim.$dim) {
            AJS.dim.$dim = AJS("div").addClass("aui-blanket");

            AJS.dim.$dim.attr('tabindex', '0'); //required, or the last element's focusout event will go to the browser

            insertBlanketAndTriggerAnimation();

            AJS.dim.cachedOverflow = $overflowEl.css("overflow");
            $overflowEl.css("overflow", "hidden");
        }

        if (zIndex) {
            AJS.dim.$dim.css({zIndex: zIndex});
        }

        return AJS.dim.$dim;
    };

    function insertBlanketAndTriggerAnimation() {
        AJS.dim.$dim.appendTo(document.body);
        AJS._internal.animation.recomputeStyle(AJS.dim.$dim);
        AJS.dim.$dim.attr('aria-hidden', 'false');
    }

    /**
     * Removes semitransparent DIV
     * @see AJS.dim
     */
    AJS.undim = function() {
        if (AJS.dim.$dim) {
            AJS.dim.$dim.attr('aria-hidden', 'true');

            $overflowEl && $overflowEl.css("overflow",  AJS.dim.cachedOverflow);

            // Safari bug workaround
            if ($.browser.safari) {
                var top = $(window).scrollTop();
                $(window).scrollTop(10 + 5 * (top == 10)).scrollTop(top);
            }
        }
    };

    var useShimDeprecationLogger = AJS.deprecate.getMessageLogger('useShim', {
        extraInfo: 'useShim has no alternative as it is now calculated by dim().'
    });

}(AJS.$));