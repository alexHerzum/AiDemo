(function($) {
    'use strict';
    function dispatch (event, target) {
        var orig = target;
        target = (typeof target === 'string') ? $(target) : target;
        target = (target instanceof $) ? target[0] : target;

        if (!target || typeof target.dispatchEvent !== 'function') {
            var msg = AJS.format('The object provided to dispatch events to did not resolve to a DOM element: was {0}', String(orig));
            var err = new Error(msg);
            err.target = target;
            throw err;
        }

        target.dispatchEvent(event);
    }

    function getLayers () {
        return $('.aui-layer');
    }

    function createFixtureItems (fixtureItems, removeOldFixtures) {
        var fixtureElement = document.getElementById('test-fixture');

        if (removeOldFixtures || removeOldFixtures === undefined) {
            fixtureElement.innerHTML = '';
        }

        if (fixtureItems) {
            for (var name in fixtureItems) {
                fixtureItems[name] = $(fixtureItems[name]).get(0);
                fixtureElement.appendChild(fixtureItems[name]);
            }
        }

        return fixtureItems;
    }

    function removeLayers () {
        var $layer;

        while ($layer = AJS.LayerManager.global.getTopLayer()) {
            AJS.LayerManager.global.popUntil($layer);
            $layer.remove();
        }

        getLayers().remove();
        AJS.undim();
        $('.aui-blanket').remove();
    }

    function warnIfLayersExist () {
        if (getLayers().length) {
            // Need to bind to console for chrome, otherwise it throws an illegal invocation error.
            console.log('Layers have been left in the DOM. These must be removed from the BODY to ensure they don\'t affect other tests. Use AJS.mocha.removeLayers().'
            );
            removeLayers();
        }
    }

    function click (element) {
        var e = new CustomEvent('click', { bubbles: true, cancelable: true });
        dispatch(e, element);
    }

    function hover (element) {
        var hoverEvents = ['mouseenter','mouseover','mousemove'];
        $.each(hoverEvents, function(i, name) {
            var e = new CustomEvent(name, { bubbles: true, cancelable: true });
            dispatch(e, element);
        });
    }

    function pressKey (keyCode, modifiers) {
        var e = new CustomEvent('keydown', { bubbles: true, cancelable: true });
        modifiers = modifiers || {};
        e.keyCode = keyCode;
        e.ctrlKey = !!modifiers.control;
        e.shiftKey = !!modifiers.shift;
        e.altKey = !!modifiers.alt;
        e.metaKey = !!modifiers.meta;
        dispatch(e, document.activeElement);
    }

    AJS.mocha = {
        click: click,
        fixtures: createFixtureItems,
        hover: hover,
        pressKey: pressKey,
        removeLayers: removeLayers,
        warnIfLayersExist: warnIfLayersExist
    };
})(AJS.$);