/*jshint expr:true */
define(['jquery', 'dialog2', 'layer', 'soy/dialog2', 'aui-mocha', 'focus-manager'], function($, dialog2Widget, layerWidget) {
    'use strict';
    describe('Dialog2 integration tests - Dialog2', function() {
        beforeEach(function() {
            sinon.spy(AJS, 'dim');
            sinon.spy(AJS, 'undim');
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function() {
            AJS.dim.restore();
            AJS.undim.restore();
            // AJS.layer.show() moves the element to be a child of the body, so clean up popups
            AJS.mocha.removeLayers();
            $('#test-fixture').remove();
        });

        function onEvent(dialog, event, fn) {
            dialog.addEventListener('aui-layer-' + event, fn);
        }

        function offEvent(dialog, event, fn) {
            dialog.removeEventListener('aui-layer-' + event, fn);
        }

        function createDialog() {
            return $(aui.dialog.dialog2({
                content: 'Hello world'
            })).appendTo('#test-fixture');
        }

        function pressEsc() {
            AJS.mocha.pressKey(AJS.keyCode.ESCAPE);
        }

        function createContentEl() {
            return $(aui.dialog.dialog2({
                content: 'Hello world'
            })).appendTo('#test-fixture');
        }

        function createInputContentEl() {
            return $(aui.dialog.dialog2({
                headerActionContent: '<button id="my-button">Button</button>',
                content: '<input type="text" id="my-input" />',
                footerActionContent: '<button id="footer-button">Footer button</button>'
            })).appendTo('#test-fixture');
        }

        function clickBlanket() {
            // We don't want to include blanket.js - which creates the blanket - in our dependencies,
            // so create a mock blanket element
            var $blanket = $('<div></div>').addClass('aui-blanket').appendTo('#test-fixture');
            $blanket.click();
        }

        it('focuses inside panel not on buttons', function() {
            var $el = $(aui.dialog.dialog2({
                headerActionContent: '<button id="my-button">Button</button>',
                content: '<input type="text" id="my-input" />'
            })).appendTo('#test-fixture');
            var buttonFocusSpy = sinon.spy();
            $('#my-button').focus(buttonFocusSpy);
            var inputFocusSpy = sinon.spy();
            $('#my-input').focus(inputFocusSpy);

            var dialog = dialog2Widget($el);
            dialog.show();

            buttonFocusSpy.should.not.have.been.called;
            inputFocusSpy.should.have.been.calledOnce;
        });

        it('focuses header if there are no other elements', function() {
            var $el = $(aui.dialog.dialog2({
                headerActionContent: '<button id="my-button">Button</button>',
                content: 'Some content (nothing you can focus)'
            })).appendTo('#test-fixture');
            var buttonFocusSpy = sinon.spy();
            $('#my-button').focus(buttonFocusSpy);

            var dialog = dialog2Widget($el);
            dialog.show();

            buttonFocusSpy.should.have.been.calledOnce;
        });

        it('creates a blanket', function() {
            var $el = createInputContentEl();

            var dialog = dialog2Widget($el);
            dialog.show();

            AJS.dim.should.have.been.calledOnce;
        });

        it('will not be removed if data-aui-remove-on-hide is not true', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);

            dialog.show();
            dialog.hide();

            expect($el.parent().length).to.be.above(0);
        });

        it('will be removed if data-aui-remove-on-hide is true', function() {
            var $el = createContentEl();
            $el.attr('data-aui-remove-on-hide','true');
            var dialog = dialog2Widget($el);

            dialog.show();
            dialog.hide();

            expect($el.parent().length).to.not.be.defined;
        });

        it('delegates events with "on"', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);

            var hideSpy = sinon.spy();

            dialog.on('hide', hideSpy);
            dialog.show();
            dialog.hide();

            hideSpy.should.have.been.calledOnce;
        });

        it('responds to native show event', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);

            var nativeShowSpy = sinon.spy();

            onEvent($el[0], 'show', nativeShowSpy);
            dialog.show();
            offEvent($el[0], 'show', nativeShowSpy);

            nativeShowSpy.should.have.been.calledOnce;
        });

        it('responds to native hide event', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);

            var nativeHideSpy = sinon.spy();

            onEvent($el[0], 'hide', nativeHideSpy);
            dialog.show();
            dialog.hide();
            offEvent($el[0], 'hide', nativeHideSpy);

            nativeHideSpy.should.have.been.calledOnce;
        });

        it('instance events can be turned off', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);

            var instanceEventSpy = sinon.spy();

            dialog.on('hide', instanceEventSpy);
            dialog.off('hide', instanceEventSpy);
            dialog.show();
            dialog.hide();

            instanceEventSpy.should.not.have.been.called;
        });

        it('instance events can be turned off native', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);

            var nativeEventSpy = sinon.spy();

            onEvent($el[0], 'hide', nativeEventSpy);
            offEvent($el[0], 'hide', nativeEventSpy);
            dialog.show();
            dialog.hide();

            nativeEventSpy.should.not.have.been.called;
        });

        it('global show event', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var globalShowEventSpy = sinon.spy();

            dialog2Widget.on('show', globalShowEventSpy);
            dialog.show();
            dialog2Widget.off('show', globalShowEventSpy);

            globalShowEventSpy.should.have.been.calledOnce;
            var $passedEl = globalShowEventSpy.args[0][1];
            expect($passedEl[0]).to.equal($el[0]);
        });

        it('global show event native', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var globalNativeShowEventSpy = sinon.spy();

            onEvent(document, 'show', globalNativeShowEventSpy);
            dialog.show();
            offEvent(document, 'show', globalNativeShowEventSpy);

            globalNativeShowEventSpy.should.have.been.calledOnce;
        });

        it('global show event not triggered by normal show events', function() {
            var $el = createContentEl();
            var globalShowEventSpy = sinon.spy();

            dialog2Widget.on('show', globalShowEventSpy);
            $el.trigger('show');
            dialog2Widget.off('show', globalShowEventSpy);

            globalShowEventSpy.should.not.have.been.called;
        });

        it('global show event not triggered by normal show events on innerElement', function() {
            var $el = createContentEl();
            var $innerEl = $('<span class="inner-component"></span>');
            $el.append($innerEl);
            var globalShowEventSpy = sinon.spy();

            dialog2Widget.on('show', globalShowEventSpy);
            $innerEl.trigger('show');
            dialog2Widget.off('show', globalShowEventSpy);

            globalShowEventSpy.should.not.have.been.called;
        });

        it('global hide event', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var globalHideEventSpy = sinon.spy();

            dialog2Widget.on('hide', globalHideEventSpy);
            dialog.show();
            dialog.hide();
            dialog2Widget.off('hide', globalHideEventSpy);

            globalHideEventSpy.should.have.been.calledOnce;
            var $passedEl = globalHideEventSpy.args[0][1];
            expect($passedEl[0]).to.equal($el[0]);
        });

        it('global hide event native', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var nativeHideEventSpy = sinon.spy();

            onEvent(document, 'hide', nativeHideEventSpy);
            dialog.show();
            dialog.hide();
            offEvent(document, 'hide', nativeHideEventSpy);

            nativeHideEventSpy.should.have.been.called;
        });

        it('global events can be turned off', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var globalEventSpy = sinon.spy();

            dialog2Widget.on('hide', globalEventSpy);
            dialog2Widget.off('hide', globalEventSpy);
            dialog.show();
            dialog.hide();

            globalEventSpy.should.not.have.been.called;
        });

        it('global events can be turned off native', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);
            var nativeEventSpy = sinon.spy();

            onEvent(document, 'hide', nativeEventSpy);
            offEvent(document, 'hide', nativeEventSpy);
            dialog.show();
            dialog.hide();

            nativeEventSpy.should.not.have.been.called;
        });

        it('two global events turned off correctly, same event name', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var hideEventSpy = sinon.spy();
            var hideEventSpy2 = sinon.spy();

            dialog2Widget.on('hide', hideEventSpy);
            dialog2Widget.on('hide', hideEventSpy2);
            dialog2Widget.off('hide', hideEventSpy);
            dialog.show();
            dialog.hide();
            dialog2Widget.off('hide', hideEventSpy2);

            hideEventSpy.should.not.have.been.called;
            hideEventSpy2.should.have.been.calledOnce;
        });

        it('two global events turned off correctly, same event name native', function() {
            var $el = createDialog();
            var dialog = dialog2Widget($el);
            var nativeHideEventSpy = sinon.spy();
            var nativeHideEventSpy2 = sinon.spy();

            onEvent(document, 'hide', nativeHideEventSpy);
            onEvent(document, 'hide', nativeHideEventSpy2);
            offEvent(document, 'hide', nativeHideEventSpy);
            dialog.show();
            dialog.hide();
            offEvent(document, 'hide', nativeHideEventSpy2);

            nativeHideEventSpy.should.not.have.been.called;
            nativeHideEventSpy2.should.have.been.calledOnce;
        });

        it('two global events turned off correctly, different event names', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var hideEventSpy = sinon.spy();
            var showEventSpy = sinon.spy();

            dialog2Widget.on('hide', hideEventSpy);
            dialog2Widget.on('show', showEventSpy);
            dialog2Widget.off('hide', hideEventSpy);
            dialog2Widget.off('show', showEventSpy);
            dialog.show();
            dialog.hide();

            hideEventSpy.should.have.not.been.called;
            showEventSpy.should.have.not.been.called;
        });

        it('two global events turned off correctly, different event names native', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);
            var hideEventSpy = sinon.spy();
            var showEventSpy = sinon.spy();

            onEvent(document, 'hide', hideEventSpy);
            onEvent(document, 'show', showEventSpy);
            offEvent(document, 'hide', hideEventSpy);
            offEvent(document, 'show', showEventSpy);
            dialog.show();
            dialog.hide();

            hideEventSpy.should.not.have.been.called;
            showEventSpy.should.not.have.been.called;
        });

        it('global beforeHide event cancels hide', function() {
            var $el = createContentEl();

            var dialog = dialog2Widget($el);
            var beforeHideStub = sinon.stub().returns(false);

            dialog2Widget.on('beforeHide', beforeHideStub);
            dialog.show();
            dialog.hide();
            dialog2Widget.off('beforeHide', beforeHideStub);

            beforeHideStub.should.have.been.called;
            expect(layerWidget($el).isVisible()).to.be.true;
        });

        it('Global hide event cancels hide native', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);

            // Set up spy with predetermined behaviour.
            var prevent = function(e) {
                e.preventDefault();
            };
            var preventDefault = { prevent: function() {} };
            var cancelHideEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

            onEvent(document, 'hide', cancelHideEventSpy);
            dialog.show();
            dialog.hide();
            offEvent(document, 'hide', cancelHideEventSpy);

            cancelHideEventSpy.should.have.been.calledOnce;
            expect(layerWidget($el).isVisible()).to.be.true;
        });

        it('global beforeShow event cancels show', function() {
            var $el = createContentEl();

            var dialog = dialog2Widget($el);
            var globalBeforeShowStub = sinon.stub().returns(false);

            dialog2Widget.on('beforeShow', globalBeforeShowStub);
            dialog.hide();
            dialog.show();
            dialog2Widget.off('beforeShow', globalBeforeShowStub);

            globalBeforeShowStub.should.have.been.calledOnce;
            expect(layerWidget($el).isVisible()).to.be.false;
        });

        it('global show event cancels show native', function() {
            var $el = createContentEl();
            var dialog = dialog2Widget($el);

            // Set up spy with predetermined behaviour.
            var prevent = function(e) {
                e.preventDefault();
            };
            var preventDefault = { prevent: function() {} };
            var cancelShowEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

            onEvent(document, 'show', cancelShowEventSpy);
            dialog.hide();
            dialog.show();
            offEvent(document, 'show', cancelShowEventSpy);

            cancelShowEventSpy.should.have.been.calledOnce;
            expect(layerWidget($el).isVisible()).to.be.false;
        });

        it('does not remove on hide when removeOnHide is false', function() {
            var $el = createContentEl();

            var dialog = dialog2Widget($el);
            dialog.show();
            dialog.hide();

            expect($el.parent().length).to.be.above(0);
        });

        it('removes on hide when removeOnHide is true', function() {
            var $el = createContentEl();
            $el.attr('data-aui-remove-on-hide','true');

            var dialog = dialog2Widget($el);
            dialog.show();
            dialog.hide();

            expect($el.parent().length).to.not.be.defined;
        });

        it('does not remove when removeOnHide is false with ESC key', function() {
            var $el = createContentEl();

            var dialog = dialog2Widget($el);
            dialog.show();

            pressEsc();

            expect($el.parent().length).to.be.above(0);
        });

        it('does remove when removeOnHide is true with ESC key', function() {
            var $el = createContentEl();
            $el.attr('data-aui-remove-on-hide', 'true');

            var dialog = dialog2Widget($el);
            dialog.show();

            pressEsc();

            expect(!$el.parent().length).to.not.be.defined;
        });

        it('does not remove on blanket on click when removeOnHide is false', function() {
            var $el = createContentEl();

            var dialog = dialog2Widget($el);
            dialog.show();

            clickBlanket();

            expect($el.parent().length).to.be.above(0);
        });

        it('does remove on blanket on click when removeOnHide is true', function() {
            var $el = createContentEl();
            $el.attr('data-aui-remove-on-hide', 'true');

            var dialog = dialog2Widget($el);
            dialog.show();

            clickBlanket();
            expect(!$el.parent().length).to.not.be.defined;
        });
    });
});