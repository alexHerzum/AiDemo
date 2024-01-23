(function ($) {
    'use strict';

    $.fn.tooltip = function (options) {

        // Pass string values straight to tipsy
        if (typeof options == 'string') {
            this.tipsy(options);
            return $this;
        }

        var allOptions = $.extend({}, $.fn.tooltip.defaults, options),
            $this = this.tipsy(allOptions);

        if (allOptions.hideOnClick &&
            (allOptions.trigger == 'hover' || !allOptions.trigger && this.tipsy.defaults.trigger == 'hover')) {
            var onClick = function() {
                $(this).tipsy('hide');
            };
            if (allOptions.live) {
                $(this.context).on('click.tipsy', this.selector, onClick);
            } else {
                this.bind('click.tipsy', onClick);
            }
        }
        return $this;
    };

    $.fn.tooltip.defaults = {
        opacity: 1.0,
        offset: 1,
        delayIn: 500,
        hoverable: true,
        hideOnClick: true
    };
}(AJS.$));
