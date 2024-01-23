/* jshint expr:true */
define(['aui/internal/alignment', 'aui-mocha'], function (Alignment) {
    'use strict';
    describe('Alignment tests -', function () {
        var layers = [];
        var $anchor;
        function createLayer (alignment) {
            var $el = AJS.$('<div id="layer-1" style="position: absolute;"></div>')
                .attr('data-aui-alignment', alignment)
                .attr('aria-hidden', false)
                .appendTo('#canvas');

            // layer needs some height so that layer :visible selector works properly
            $el.height(16);
            $el.width(16);

            layers.push($el);

            return $el;
        }

        function comparePosition (position, expected) {
            var topOffset = expected.topOffset || 0;
            var leftOffset = expected.leftOffset || 0;

            return (position.top === expected.y - topOffset) &&
                (position.left === expected.x - leftOffset);
        }

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            var $el = AJS.$('<div id="canvas" style="position: absolute;"></div>')
                .appendTo('#test-fixture');

            $el.height(100);
            $el.width(100);
            $el.css({top: 0, left: 0});

            $anchor = AJS.$('<div aria-controls="layer-1" style="position: relative;">Im the target</div>')
                .appendTo('#canvas');

            // throw it in the middle of the canvas
            $anchor.css({top: 40, left: 40});
            $anchor.height(10);
            $anchor.width(10);
        });

        afterEach(function () {
            layers.forEach(function (el) {
                el.remove();
            });
            $('#test-fixture').remove();
        });

        it('Expected offsets', function () {
            var expectedOffsets = [
                {position: '', y: 37, x: 50},
                {position: 'bad position', y: 37, x: 50},

                {position: 'bottom right', y: 50, x: 34},
                {position: 'bottom center', y: 50, x: 37},
                {position: 'bottom left', y: 50, x: 40},

                {position: 'top left', y: 24, x: 40},
                {position: 'top center', y: 24, x: 37},
                {position: 'top right', y: 24, x: 34},

                {position: 'right top', y: 40, x: 50},
                {position: 'right middle', y: 37, x: 50},
                {position: 'right bottom', y: 34, x: 50},

                {position: 'left top', y: 40, x: 24},
                {position: 'left middle', y: 37, x: 24},
                {position: 'left bottom', y: 34, x: 24}
            ];

            expectedOffsets.forEach(function (expected) {
                var $layer = createLayer(expected.position);

                var alignment = new Alignment($layer.get(0), document.querySelector('[aria-controls="layer-1"]'));
                alignment.enable();

                var offset = $layer.offset();
                expect(
                    comparePosition(offset, expected),
                        expected.position +
                        ': expected "' +
                        expected.x +
                        ', ' +
                        expected.y +
                        '" but got "' +
                        offset.left +
                        ', ' +
                        offset.top +
                        '"'
                ).to.be.true;

                alignment.destroy();
                $layer.remove();
            });
        });
    });
});