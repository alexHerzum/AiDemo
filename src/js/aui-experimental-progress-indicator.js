//API
(function() {
    'use strict';
    function updateProgress($progressBar, $progressBarContainer, progressValue) {
        AJS._internal.animation.recomputeStyle($progressBar);
        $progressBar.css("width", progressValue * 100 + "%");
        $progressBarContainer.attr("data-value", progressValue);
    }



    AJS.progressBars = {
        update: function(element, value){
            var $progressBarContainer = AJS.$(element).first();
            var $progressBar = $progressBarContainer.children(".aui-progress-indicator-value");
            var currentProgress = $progressBar.attr("data-value") || 0;

            var afterTransitionEvent = "aui-progress-indicator-after-update";
            var beforeTransitionEvent = "aui-progress-indicator-before-update";
            var transitionEnd = "transitionend webkitTransitionEnd";

            var isIndeterminate = !$progressBarContainer.attr("data-value");

            //if the progress bar is indeterminate switch it.
            if (isIndeterminate) {
                $progressBar.css("width", 0);
            }

            if (typeof value === "number" && value<= 1 && value >= 0) {
                $progressBarContainer.trigger(beforeTransitionEvent, [currentProgress, value]);

                //detect whether transitions are supported
                var documentBody = document.body || document.documentElement;
                var style = documentBody.style;
                var transition = 'transition';

                //trigger the event after transition end if supported, otherwise just trigger it
                if (typeof style.transition === 'string' || typeof style.WebkitTransition === "string") {
                    $progressBar.one(transitionEnd, function() {
                        $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
                    });
                    updateProgress($progressBar, $progressBarContainer, value);
                } else {
                    updateProgress($progressBar, $progressBarContainer, value);
                    $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
                }


            }
            return $progressBarContainer;
        },
        setIndeterminate: function(element) {
            var $progressBarContainer = AJS.$(element).first();
            var $progressBar = $progressBarContainer.children(".aui-progress-indicator-value");

            $progressBarContainer.removeAttr("data-value");
            AJS._internal.animation.recomputeStyle($progressBarContainer);
            $progressBar.css("width", "100%");
        }
    };
}());

