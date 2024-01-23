;(function(init) {
    'use strict';

    AJS.Alignment = init(window.Tether);
    if (typeof window.define === 'function') {
        define(['aui/internal/tether'], function() {
            return AJS.Alignment;
        });
    }
})(function (Tether) {
    'use strict';


    var ATTR_ALIGNMENT = 'data-aui-alignment';
    var ATTR_ALIGNMENT_STATIC = 'data-aui-alignment-static';
    var CLASS_PREFIX_ALIGNMENT = 'aui-alignment';
    var CLASS_PREFIX_SIDE = 'aui-alignment-side-';
    var CLASS_PREFIX_SNAP = 'aui-alignment-snap-';
    var DEFAULT_ATTACHMENT = 'right middle';


    var attachmentMap = {
        'top left': { el:'bottom left', target: 'top left' },
        'top center': { el: 'bottom center', target: 'top center' },
        'top right': { el: 'bottom right', target: 'top right' },
        'right top': { el: 'top left', target: 'top right' },
        'right middle': { el: 'middle left', target: 'middle right' },
        'right bottom': { el: 'bottom left', target: 'bottom right' },
        'bottom left': { el: 'top left', target: 'bottom left' },
        'bottom center': { el: 'top center', target: 'bottom center' },
        'bottom right': { el: 'top right', target: 'bottom right' },
        'left top': { el: 'top right', target: 'top left' },
        'left middle': { el: 'middle right', target: 'middle left' },
        'left bottom': { el: 'bottom right', target: 'bottom left' }
    };


    function addAlignmentClasses(element, side, snap) {
        var sideClass = CLASS_PREFIX_SIDE + side;
        var snapClass = CLASS_PREFIX_SNAP + snap;
        element.className += ' ' + sideClass + ' ' + snapClass;
    }

    function getAlignment(element) {
        var alignment = (element.getAttribute(ATTR_ALIGNMENT) || DEFAULT_ATTACHMENT).split(' ');
        return {
            side: alignment[0],
            snap: alignment[1]
        };
    }

    function getAttachment(side, snap) {
        return attachmentMap[side + ' ' + snap] || attachmentMap[DEFAULT_ATTACHMENT];
    }


    function Alignment (element, target) {
        var alignment = getAlignment(element);
        var attachment = getAttachment(alignment.side, alignment.snap);
        var isStaticallyAligned = element.hasAttribute(ATTR_ALIGNMENT_STATIC);
        var tether = new Tether({
            enabled: false,
            element: element,
            target: target,
            attachment: attachment.el,
            targetAttachment: attachment.target,
            classPrefix: CLASS_PREFIX_ALIGNMENT,
            constraints: [
                {
                    // Try and keep the element on page
                    to: 'window',
                    attachment: isStaticallyAligned === true ? 'none' : 'together'
                }
            ]
        });

        addAlignmentClasses(element, alignment.side, alignment.snap);

        this._auiTether = tether;
    }

    Alignment.prototype = {
        /**
         * Stops aligning and cleans up.
         *
         * @returns {Alignment}
         */
        destroy: function () {
            this._auiTether.destroy();
            return this;
        },

        /**
         * Disables alignment.
         *
         * @returns {Alignment}
         */
        disable: function () {
            this._auiTether.disable();
            return this;
        },

        /**
         * Enables alignment.
         *
         * @returns {Alignment}
         */
        enable: function () {
            this._auiTether.enable();
            return this;
        }
    };

    return Alignment;
});
