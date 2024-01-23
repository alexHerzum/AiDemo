(function($) {
    'use strict';

    var $doc = $(document);

    function initCloseLayerOnEscPress() {
        $doc.on('keydown', function(e) {
            if (e.keyCode === AJS.keyCode.ESCAPE) {
                AJS.LayerManager.global.popUntilTopPersistent();
                e.preventDefault();
            }
        });
    }

    function initCloseLayerOnBlanketClick() {
        $doc.on('click', '.aui-blanket', function(e) {
            if (AJS.LayerManager.global.popUntilTopBlanketed()) {
                e.preventDefault();
            }
        });
    }

    /*
        If its a click on a trigger, do nothing.
        If its a click on a layer, close all layers above.
        Otherwise, close all layers
     */
    function initCloseLayerOnOuterClick () {
        $doc.on('click', function (e) {
            var $target = $(e.target);
            if ($target.closest('.aui-blanket').length) {
                return;
            }

            var $trigger = $target.closest('[aria-controls]');
            var $layer = $target.closest('.aui-layer');
            if (!$layer.length && !hasLayer($trigger)) {
                AJS.LayerManager.global.hideAll();
                return;
            }

            // Triggers take precedence over layers
            if (hasLayer($trigger)) {
                return;
            }

            if ($layer.length) {
                // We dont want to explicitly call close on a modal dialog if it happens to be next.
                // All blanketed layers should be below us, as otherwise the blanket should have caught the click.
                // We make sure we dont close a blanketed one explicitly as a hack, this is to fix the problem arising
                // from dialog2 triggers inside dialog2's having no aria controls, where the dialog2 that was just
                // opened would be closed instantly
                var $next = AJS.LayerManager.global.getNextHigherNonPeristentAndNonBlanketedLayer($layer);

                if ($next) {
                    AJS.layer($next).hide();
                }
            }
        });
    }

    function hasLayer($trigger) {
        if (!$trigger.length) {
            return false;
        }

        var layer = document.getElementById($trigger.attr('aria-controls'));
        return AJS.LayerManager.global.indexOf(layer) > -1;
    }

    initCloseLayerOnEscPress();
    initCloseLayerOnBlanketClick();
    initCloseLayerOnOuterClick();

    AJS.LayerManager.global = new AJS.LayerManager();
}(AJS.$));
