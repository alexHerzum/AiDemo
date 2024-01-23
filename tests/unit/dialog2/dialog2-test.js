/*jshint expr:true */
define(['jquery', 'dialog2', 'layer', 'aui/internal/browser', 'aui/internal/widget', 'soy/dialog2', 'aui-mocha'], function($, dialog2Widget, layerWidget, browser) {
    'use strict';
    describe('Dialog2', function () {
        describe('soy tests -', function() {
            it('Dialog2 creates close button for non-modal', function () {
                var $el = $(aui.dialog.dialog2({
                    content: 'hello world'
                }));

                expect($el.find('.aui-dialog2-header-close').length).to.be.above(0);
            });

            it('Dialog2 does not create close button for modal', function () {
                var $el = $(aui.dialog.dialog2({
                    content: 'hello world',
                    modal: true
                }));

                expect(!$el.find('.aui-dialog2-header-close').length).to.be.above(0);
            });
        });


        describe('unit tests -', function () {
            beforeEach(function () {
                $('<div id="test-fixture"></div>').appendTo(document.body);
                sinon.stub(browser, 'supportsCalc').returns(true);
            });

            afterEach(function () {
                $('#test-fixture').remove();
                browser.supportsCalc.restore();
                AJS.mocha.removeLayers();
            });

            // Creates a mock of a layer object. AJS.layer will return this when passed the given $el
            function createLayerMock($el) {
                var layerInstance = {
                    show: function (){},
                    hide: function (){},
                    remove: function (){},
                    isVisible: function (){},
                    on: function (){},
                    above: function (){},
                    below: function (){}
                };
                var mockedLayer = sinon.mock(layerInstance);
                $el.data('_aui-widget-layer', layerInstance);
                return mockedLayer;
            }

            function createContentEl() {
                return $(aui.dialog.dialog2({
                    content: 'Hello world'
                })).appendTo('#test-fixture');
            }

            it('Dialog2 creates a dialog with given content', function () {
                var $el = createContentEl();

                var dialog = dialog2Widget($el);

                expect($el[0]).to.equal(dialog.$el[0]);
            });

            it('Dialog2 wraps layer for show, hide, remove', function () {
                expect(0);
                var $el = createContentEl();
                var dialog = dialog2Widget($el);
                var layerMock = createLayerMock(dialog.$el);
                layerMock.expects('show').once();
                layerMock.expects('hide').once();
                layerMock.expects('remove').once();

                dialog.show();
                dialog.hide();
                dialog.remove();

                layerMock.verify();
            });

            it('Dialog2 hide is called on close button click', function () {
                expect(0);
                var $el = createContentEl();
                var $close = $('<div></div>').addClass('aui-dialog2-header-close').appendTo($el);
                var dialog = dialog2Widget($el);
                var layerMock = createLayerMock(dialog.$el);
                layerMock.expects('hide').once();
                dialog.show();

                $close.click();

                layerMock.verify();
            });

            it('Dialog2 wraps layer events', function () {
                expect(0);
                var $el = createContentEl();
                var dialog = dialog2Widget($el);
                var layerMock = createLayerMock(dialog.$el);
                var fn = function () {};
                layerMock.expects('on').once().withArgs('show', fn);

                dialog.on('show', fn);

                layerMock.verify();
            });
        });
    });
});