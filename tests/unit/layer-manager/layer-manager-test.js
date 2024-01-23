/* jshint expr:true */
define(['jquery', 'underscore', 'layer-manager', 'aui-mocha'], function ($, _) {
    'use strict';

    describe('Layer Manager', function () {
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            AJS.mocha.removeLayers();
            $('#test-fixture').remove();
        });

        /**
         * @returns {jQuery}
         */
        function createLayer (blanketed) {
            var $layer = $('<div>');
            $layer.appendTo('#test-fixture');
            if (blanketed) {
                $layer.attr('data-aui-blanketed', true);
            }
            return $layer;
        }

        /**
         * @returns {jQuery}
         */
        function createBlanketedLayer () {
            return createLayer(true);
        }

        function layers () {
            return AJS.LayerManager.global;
        }

        it('push() accepts jQuery elements', function () {
            var $layer1 = createLayer();
            layers().push($layer1);

            expect(layers().indexOf($layer1)).to.equal(0);
        });

        it('push() accepts HTML elements', function () {
            var $layer1 = createLayer();
            layers().push($layer1[0]);

            expect(layers().indexOf($layer1)).to.equal(0);
        });

        it('indexOf() should return the correct index', function () {
            var $layer1 = createBlanketedLayer();
            var $layer2 = createBlanketedLayer();
            var $nonExistentLayer = createLayer();

            layers().push($layer1);
            layers().push($layer2);

            expect(layers().indexOf($nonExistentLayer)).to.equal(-1);
            expect(layers().indexOf($layer1)).to.equal(0);
            expect(layers().indexOf($layer2)).to.equal(1);
        });

        it('indexOf() accepts HTML elements', function () {
            var $layer1 = createBlanketedLayer();
            var $layer2 = createLayer();

            layers().push($layer1);
            layers().push($layer2[0]);

            expect(layers().indexOf($layer1[0])).to.equal(0);
            expect(layers().indexOf($layer2)).to.equal(1);
        });

        it('item() returns a jQuery element', function () {
            var $layer1 = createLayer();
            layers().push($layer1[0]);

            expect(layers().item(0) instanceof $).to.be.true;
        });

        it('item() should return the correct element', function () {
            var $layer1 = createBlanketedLayer();
            var $layer2 = createLayer();

            layers().push($layer1);
            layers().push($layer2);

            expect(layers().item(0)[0]).to.equal($layer1[0]);
            expect(layers().item(1)[0]).to.equal($layer2[0]);
        });

        it('item() returns same jQuery object if jQuery pushed', function () {
            var $layer1 = createBlanketedLayer();
            var $layer2 = createLayer();

            layers().push($layer1);
            layers().push($layer2[0]);

            expect(layers().item(0)).to.equal($layer1);
            expect(layers().item(1)).to.not.equal($layer2);
            // NOTE AUI-2604 - We may not actually care about the jQuery object equivalence.
        });

        describe('layering -', function () {
            var $blanketedLayerOne,
                $normalLayerOne,
                $normalLayerTwo,
                $normalLayerThree;

            beforeEach(function () {
                $blanketedLayerOne = createBlanketedLayer();
                $normalLayerOne = createLayer();
                $normalLayerTwo = createLayer();
                $normalLayerThree = createLayer();
            });

            // AUI-2590
            it('push() will implicitly remove other layers at the current level in the stack', function () {
                layers().push($normalLayerOne);
                layers().push($normalLayerTwo);

                expect(layers().indexOf($normalLayerOne)).to.equal(-1);
                expect(layers().indexOf($normalLayerTwo)).to.equal(0);

                layers().push($normalLayerThree);

                expect(layers().indexOf($normalLayerOne)).to.equal(-1);
                expect(layers().indexOf($normalLayerTwo)).to.equal(-1);
                expect(layers().indexOf($normalLayerThree)).to.equal(0);
            });

            it('push() will stack layers that have a parent-child relationship', function () {
                $normalLayerOne.attr('id', 'one').html('<span aria-controls="two"></span>');
                $normalLayerTwo.attr('id', 'two').html('<span aria-controls="three"></span>');
                $normalLayerThree.attr('id', 'three');

                layers().push($normalLayerOne);
                layers().push($normalLayerTwo);

                expect(layers().indexOf($normalLayerOne)).to.equal(0);
                expect(layers().indexOf($normalLayerTwo)).to.equal(1);

                layers().push($normalLayerThree);

                expect(layers().indexOf($normalLayerOne)).to.equal(0);
                expect(layers().indexOf($normalLayerTwo)).to.equal(1);
                expect(layers().indexOf($normalLayerThree)).to.equal(2);
            });

            it('push() will start new layer level on top of blanketed layer', function () {
                layers().push($blanketedLayerOne);
                layers().push($normalLayerOne);

                expect(layers().indexOf($blanketedLayerOne)).to.equal(0);
                expect(layers().indexOf($normalLayerOne)).to.equal(1);
            });
        });

        describe('layer removal -', function () {
            var $layerOne,
                $layerTwo,
                $layerThree,
                $layerFour,
                $layerFive,
                $layerSix,
                $nonExistentLayer;

            beforeEach(function () {
                $layerOne = createLayer();
                $layerTwo = createLayer();
                $layerThree = createLayer();
                parentChild($layerOne, $layerTwo);
                parentChild($layerTwo, $layerThree);

                $layerFour = createBlanketedLayer();
                parentChild($layerThree, $layerFour);

                $layerFive = createLayer();
                $layerSix = createLayer();
                parentChild($layerFive, $layerSix);

                $nonExistentLayer = createLayer();

                layers().push($layerOne);
                layers().push($layerTwo);
                layers().push($layerThree);
                layers().push($layerFour);
                layers().push($layerFive);
                layers().push($layerSix);

                expect(layers().indexOf($layerSix)).to.equal(5);
            });

            function parentChild(parentLayer, childLayer) {
                var id = _.uniqueId();
                childLayer.attr('id', id);
                parentLayer.html('<span aria-controls="' + id + '"></span>');
            }

            it('popUntil() returns top-most layer after popping all non-modals', function () {
                var result = layers().popUntil($layerFive);

                expect(layers().indexOf($layerSix)).to.equal(-1);
                expect(layers().indexOf($layerFive)).to.equal(-1);
                expect(layers().indexOf($layerFour)).to.equal(3);
                expect(result[0]).to.equal($layerFive[0]);
            });

            it('popUntil() returns null if argument is not a layer', function () {
                var result = layers().popUntil($nonExistentLayer);

                expect(result).to.not.be.defined;
            });

            it('popUntil() returns null if layer was not on stack', function () {
                layers().popUntil($layerFive);
                var result = layers().popUntil($layerFive);

                expect(result).to.not.be.defined;
            });

            it('popUntil() accepts HTML elements', function () {
                var result = layers().popUntil($layerFive[0]);

                expect(result[0]).to.equal($layerFive[0]);
            });
        });

        describe('blanket tests -', function () {
            function getVisibleBlankets() {
                var $blankets = AJS.$('.aui-blanket');
                var blanketIsVisible = AJS.$('.aui-blanket').css('visibility') !== 'hidden';
                return $blankets.length && blanketIsVisible ? $blankets : [];
            }

            it('Creating a blanketed layer makes a blanket appear', function () {
                layers().push(createBlanketedLayer());
                expect(getVisibleBlankets().length).to.be.defined;
            });

            it('Creating a normal layer makes no blanket appear', function () {
                layers().push(createLayer());
                expect(getVisibleBlankets().length).to.be.not.defined;
            });

            it('Creating a blanketed layer makes no blanket appear', function () {
                layers().push(createBlanketedLayer());
                layers().popTopIfNonPersistent();
                expect(getVisibleBlankets().length).to.be.not.defined;
            });
        });
    });
});