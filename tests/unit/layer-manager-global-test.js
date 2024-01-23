/* jshint expr:true */
define(['layer-manager-global', 'aui-mocha'], function () {
    'use strict';
    describe('Layer Manager - ', function () {
        var dimSpy,
            undimSpy,
            layerManagerPopTopSpy,
            layerManagerPopUntilTopBlanketedSpy;

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            AJS.LayerManager.global = new AJS.LayerManager();
            dimSpy = sinon.spy(AJS, 'dim');
            undimSpy = sinon.spy(AJS, 'undim');
            layerManagerPopTopSpy = sinon.stub(AJS.LayerManager.global, 'popTopIfNonPersistent');
            layerManagerPopUntilTopBlanketedSpy = sinon.stub(AJS.LayerManager.global, 'popUntilTopBlanketed');
        });

        afterEach(function () {
            $('#test-fixture').remove();
            AJS.mocha.removeLayers();
            layerManagerPopTopSpy.restore();
            layerManagerPopUntilTopBlanketedSpy.restore();
            dimSpy.restore();
            undimSpy.restore();
        });

        function createLayer (blanketed, modal, persistent) {
            var $el = AJS.$('<div></div>').addClass('aui-layer').attr('aria-hidden', 'true').appendTo('#test-fixture');
            if (blanketed) {
                $el.attr('data-aui-blanketed', true);
            }

            if (modal) {
                $el.attr('data-aui-modal', true);
            }

            if (persistent) {
                $el.attr('data-aui-persistent', true);
            }

            return $el;
        }

        function createBlanketedLayer () {
            return createLayer().attr('data-aui-blanketed', 'true');
        }

        function pressEsc () {
            AJS.mocha.pressKey(AJS.keyCode.ESCAPE);
        }

        function click (el) {
            AJS.mocha.click(el);
        }

        it('Pressing ESC hides the layer', function () {
            var $el = createLayer();

            AJS.LayerManager.global.push($el);
            pressEsc();
            expect(AJS.layer($el).isVisible()).to.be.false;
        });

        it('Pressing ESC hides the top layer only', function () {
            var $layer1 = createLayer(true);
            var $layer2 = createLayer();

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);

            pressEsc();

            expect(AJS.layer($layer1).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.false;
        });

        it('Clicking blanket calls popUntilTopBlanketed()', function () {
            var $layer1 = createLayer();
            var $layer2 = createLayer(true);

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);

            click('.aui-blanket');

            layerManagerPopUntilTopBlanketedSpy.should.have.been.calledOnce;
        });

        it('Pressing ESC hides the non modal/persistent layers', function () {
            var $modalLayer = createLayer(false, true);
            var $persistentLayer = createLayer(false, false, true);
            var $layer1 = createLayer();

            AJS.LayerManager.global.push($modalLayer);
            AJS.LayerManager.global.push($persistentLayer);
            AJS.LayerManager.global.push($layer1);

            pressEsc();
            pressEsc();

            expect(AJS.layer($modalLayer).isVisible()).to.be.true;
            expect(AJS.layer($persistentLayer).isVisible()).to.be.true;
            expect(AJS.layer($layer1).isVisible()).to.be.false;
        });

        it('Pressing ESC hides the first non modal/persistent layer, but not under the modal blanket', function () {
            var $layer1 = createLayer(true);
            var $layer2 = createLayer(true, true);
            var $persistentLayer = createLayer(false, false, true);
            var $layer3 = createLayer();

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);
            AJS.LayerManager.global.push($persistentLayer);
            AJS.LayerManager.global.push($layer3);

            pressEsc();
            pressEsc();

            expect(AJS.layer($layer1).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.true;
            expect(AJS.layer($layer3).isVisible()).to.be.false;
            expect(AJS.layer($persistentLayer).isVisible()).to.be.true;
        });

        it('Pressing ESC hides the first non modal/persistent layers and any layers ontop as a result', function () {
            var $layer1 = createLayer(true);
            var $layer2 = createLayer(true, true);
            var $layer3 = createLayer(true);
            var $modalLayer = createLayer(false, true);
            var $persistentLayer = createLayer(false, false, true);

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);
            AJS.LayerManager.global.push($layer3);
            AJS.LayerManager.global.push($modalLayer);
            AJS.LayerManager.global.push($persistentLayer);

            pressEsc();
            pressEsc();

            expect(AJS.layer($layer1).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.true;
            expect(AJS.layer($layer3).isVisible()).to.be.false;
            expect(AJS.layer($modalLayer).isVisible()).to.be.false;
            expect(AJS.layer($persistentLayer).isVisible()).to.be.false;
        });

        it('Pressing ESC stops at the first blanket, with top modal', function () {
            var $layer1 = createLayer(true, false);
            var $layer2 = createLayer(true, true);
            var $layer3 = createLayer(false, true);

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);
            AJS.LayerManager.global.push($layer3);

            pressEsc();

            expect(AJS.layer($layer1).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.true;
            expect(AJS.layer($layer3).isVisible()).to.be.true;
        });

        it('Clicking blanket should hide the layer', function () {
            var $el = createBlanketedLayer();

            AJS.LayerManager.global.push($el);
            click('.aui-blanket');
            layerManagerPopUntilTopBlanketedSpy.should.have.been.calledOnce;
        });

        it('Clicking anywhere outside of the top layer should close it', function () {
            var $layer = createLayer();

            AJS.LayerManager.global.push($layer);
            click(document);
            expect(AJS.layer($layer).isVisible()).to.be.false;
        });

        it('Clicking outside all layers should close all layers', function () {
            var $layer1 = createLayer();
            var $layer2 = createLayer();

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);

            click(document);

            expect(AJS.layer($layer1).isVisible()).to.be.false;
            expect(AJS.layer($layer2).isVisible()).to.be.false;
        });

        it('Clicking outside all layers should close all non modal/persistent layers', function () {
            var $layer1 = createLayer();
            var $modalLayer = createLayer(false, true);
            var $layer2 = createLayer();
            var $persistentLayer = createLayer(false, false, true);

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($modalLayer);
            AJS.LayerManager.global.push($layer2);
            AJS.LayerManager.global.push($persistentLayer);

            click(document);

            expect(AJS.layer($layer1).isVisible()).to.be.false;
            expect(AJS.layer($modalLayer).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.false;
            expect(AJS.layer($persistentLayer).isVisible()).to.be.true;
        });

        it('Clicking a layer should close all layers above it if not modal/persistent', function () {
            var $modalLayer1 = createLayer(false, true);
            var $layer2 = createLayer(true);
            var $modalLayer2 = createLayer(false, true);
            var $layer3 = createLayer();

            AJS.LayerManager.global.push($modalLayer1);
            AJS.LayerManager.global.push($layer2);
            AJS.LayerManager.global.push($modalLayer2);
            AJS.LayerManager.global.push($layer3);

            click($layer2[0]);

            expect(AJS.layer($modalLayer2).isVisible()).to.be.true;
            expect(AJS.layer($layer2).isVisible()).to.be.true;
            expect(AJS.layer($modalLayer2).isVisible()).to.be.true;
            expect(AJS.layer($layer3).isVisible()).to.be.false;
        });

        it('Calling popUntil() triggers the beforeHide event on each layer.', function () {
            var beforeHideSpy = sinon.spy();
            var hideSpy = sinon.spy();
            var $layer1 = createLayer(true);
            var $layer2 = createLayer();

            AJS.LayerManager.global.push($layer1);
            AJS.LayerManager.global.push($layer2);

            AJS.layer($layer2).on('beforeHide', beforeHideSpy);

            $layer2.get(0).addEventListener('aui-layer-hide', hideSpy);

            AJS.LayerManager.global.popUntil($layer1);

            beforeHideSpy.should.have.been.calledBefore(hideSpy);
            hideSpy.should.have.been.calledOne;
            expect(AJS.layer($layer1).isVisible()).to.be.false;
            expect(AJS.layer($layer2).isVisible()).to.be.false;
        });
    });
});