;(function(exports) {
    'use strict';
    exports._internal = exports._internal || {};
    exports._internal.animation = {};

    /**
     * Force a re-compute of the style of an element.
     *
     * This is useful for CSS transitions and animations that need computed style changes to occur.
     * CSS transitions will fire when the computed value of the property they are transitioning changes.
     * This may not occur if the style changes get batched into one style change event by the browser.
     * We can force the browser to recognise the two different computed values by calling this function when we want it
     * to recompute the styles.
     *
     * For example, consider a transition on the opacity property.
     * 
     * With recomputeStyle:
     * $parent.append($el); //opacity=0
     * AJS._internal.animation.recomputeStyle($el);
     * $el.addClass('visible'); //opacity=1
     * //Browser calculates value of opacity=0, and then transitions it to opacity=1
     *
     * Without recomputeStyle:
     * $parent.append($el); //opacity=0
     * $el.addClass('visible'); //opacity=1
     * //Browser calculates value of opacity=1 but no transition
     *
     * @param el The DOM or jQuery element for which style should be recomputed
     */
    exports._internal.animation.recomputeStyle = function(el) {
        var el = el.length ? el[0] : el;
        //Force a style compute by getting an arbitrary CSS value
        window.getComputedStyle(el, null).getPropertyValue('left');
    };
}(AJS));