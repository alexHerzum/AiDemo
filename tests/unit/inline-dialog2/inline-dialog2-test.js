/* jshint expr:true */
define([
    'jquery',
    'aui/internal/skate',
    'aui/inline-dialog2',
    'soy/inline-dialog2',
    'aui/trigger',
    'aui/internal/tether',
    'layer',
    'aui-mocha'
], function ($, skate) {
    'use strict';
    describe('Inline Dialog2 -', function () {
        var trigger;
        var inlineDialog;
        var spy;

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            AJS.mocha.removeLayers();
            $('#test-fixture').remove();
        });

        function simulateTriggerClick () {
            AJS.mocha.click(trigger);
        }

        function simulateDialogClick () {
            AJS.mocha.click(inlineDialog);
        }

        function createMessage (type) {
            return AJS.$.Event(type);
        }

        function sendMessage (type) {
            inlineDialog.message(createMessage(type));
        }

        function pressEsc () {
            AJS.mocha.pressKey(AJS.keyCode.ESCAPE);
        }

        function onEvent (inlineDialog, event, fn) {
            inlineDialog.addEventListener('aui-layer-' + event, fn);
        }

        function offEvent (inlineDialog, event, fn) {
            inlineDialog.removeEventListener('aui-layer-' + event, fn);
        }

        describe('Basic Functionality -', function () {
            beforeEach(function () {
                trigger = $('<button data-aui-trigger="" aria-controls="inline-dialog2-1"></button>').appendTo('#test-fixture').get(0);
                inlineDialog = $(aui.inlineDialog2.inlineDialog2({
                    id: 'inline-dialog2-1',
                    alignment : 'bottom center',
                    respondsTo: 'toggle',
                    content: '<h3>I was generated by soy :)</h3>'
                })).appendTo('#test-fixture').get(0);
                skate.init(trigger);
                skate.init(inlineDialog);
            });

            it('Should default to hidden', function () {
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Correct element should be focused if visible and persistent', function () {
                var $inlineDialog = $(inlineDialog);
                var $myInput = $('<input type="text" id="my-input">');
                var dialogFocusSpy = sinon.spy();
                var inputFocusSpy = sinon.spy();

                $inlineDialog.attr('data-aui-persistent', 'true');
                $inlineDialog.append($myInput);
                $inlineDialog.focus(dialogFocusSpy);
                $myInput.focus(inputFocusSpy);

                simulateTriggerClick();

                dialogFocusSpy.should.not.have.been.called;
                inputFocusSpy.should.have.been.calledOnce;
            });

            it('Should close when escape pressed if open', function () {
                simulateTriggerClick();
                pressEsc();
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Should not close when clicked if open', function () {
                simulateTriggerClick();
                simulateDialogClick();
                expect(inlineDialog.isVisible()).to.be.true;
            });
        });

        describe('Triggers -', function () {
            it('Should add the aria-haspopup attribute to its trigger', function () {
                var fixture = AJS.mocha.fixtures({
                    trigger: '<button aria-controls="my-inline-dialog"></button>',
                    inlineDialog: '<div id="my-inline-dialog" class="aui-inline-dialog2"></div>'
                });

                skate.init(fixture.inlineDialog);
                expect(fixture.trigger.getAttribute('aria-haspopup')).to.equal('true');
            });

            it('Should set the aria-expended attribute when showing and hiding', function () {
                var fixtures = AJS.mocha.fixtures({
                    trigger: '<button aria-controls="my-inline-dialog"></button>',
                    inlineDialog: '<div id="my-inline-dialog" class="aui-inline-dialog2"></div>'
                });

                skate.init(fixtures.inlineDialog);
                expect(fixtures.trigger.getAttribute('aria-expanded')).to.equal('false');
                fixtures.inlineDialog.show();
                expect(fixtures.trigger.getAttribute('aria-expanded')).to.equal('true');
                fixtures.inlineDialog.hide();
                expect(fixtures.trigger.getAttribute('aria-expanded')).to.equal('false');
            });
        });

        describe('Messages -', function () {
            var sandbox;
            beforeEach(function () {
                sandbox = sinon.sandbox.create();
                inlineDialog = $(aui.inlineDialog2.inlineDialog2({
                    id: 'inline-dialog2-1',
                    alignment : '',
                    respondsTo: 'hover',
                    content: '<h3>I was generated by soy :)</h3>'
                })).appendTo('#test-fixture').get(0);
                skate.init(inlineDialog);
            });

            afterEach(function () {
                sandbox.restore();
            });

            it('Hover inline dialog should not respond to click messages', function () {
                sendMessage('click');
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Hover inline dialog should not respond to invalid messages', function () {
                sendMessage('blah');
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Hover inline dialog should open on mouseenter message', function () {
                sendMessage('mouseenter');
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Hover inline dialog should close on mouseleave message', function () {
                var spy = sandbox.spy();
                var time = sandbox.useFakeTimers();

                inlineDialog.addEventListener('aui-layer-hide', spy);
                inlineDialog.show();
                sendMessage('mouseleave');

                time.tick(1000);
                expect(spy.callCount).to.equal(1);
            });

            it('Hover persistent inline dialog should not close on mouseleave message', function () {
                var time = sandbox.useFakeTimers();
                inlineDialog.setAttribute('data-aui-persistent', true);

                sendMessage('mouseenter');
                expect(inlineDialog.isVisible()).to.be.true;

                sendMessage('mouseleave');
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Hover inline dialog should not close if hovered over regardless of event ordering', function () {
                var time = sandbox.useFakeTimers();

                sendMessage('mouseenter');
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.true;

                inlineDialog.dispatchEvent(new CustomEvent('mouseenter'));
                sendMessage('mouseleave');
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Hover inline dialog should close if no longer hovered', function () {
                var time = sandbox.useFakeTimers();

                sendMessage('mouseenter');
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.true;

                sendMessage('mouseleave');
                inlineDialog.dispatchEvent(new CustomEvent('mouseenter'));
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.true;

                inlineDialog.dispatchEvent(new CustomEvent('mouseleave'));
                time.tick(1000);
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Hover inline dialog should not close if hovered over before the delay is executed', function () {
                var layerHideSpy = sandbox.spy();
                var time = sandbox.useFakeTimers();

                inlineDialog.addEventListener('aui-layer-hide', layerHideSpy);
                inlineDialog.show();
                sendMessage('mouseleave');

                time.tick(999);
                inlineDialog.dispatchEvent(new CustomEvent('mouseenter'));
                time.tick(1);

                layerHideSpy.should.not.have.been.called;
            });

            it('Hovering over the trigger after hovering out of it should not allow the inline dialog to close', function () {
                var layerHideSpy = sandbox.spy();
                var time = sandbox.useFakeTimers();

                inlineDialog.addEventListener('aui-layer-hide', layerHideSpy);
                inlineDialog.show();

                trigger.dispatchEvent(new CustomEvent('mouseleave'));
                time.tick(500);

                trigger.dispatchEvent(new CustomEvent('mouseenter'));
                time.tick(500);

                layerHideSpy.should.not.have.been.called;
            });

            it('Hover inline dialog should open on focus message', function () {
                sendMessage('focus');
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Hover inline dialog should close on blur message', function () {
                inlineDialog.show();
                sendMessage('blur');
                expect(inlineDialog.isVisible()).to.be.false;
            });
        });

        describe('Events -', function () {
            beforeEach(function () {
                inlineDialog = $(aui.inlineDialog2.inlineDialog2({
                    id: 'inline-dialog2-1',
                    content: '<h3>I was generated by soy :)</h3>'
                })).appendTo('#test-fixture').get(0);
                skate.init(inlineDialog);

                spy = sinon.spy();
            });

            it('Local show event', function () {
                onEvent(inlineDialog, 'show', spy);
                inlineDialog.show();
                offEvent(inlineDialog, 'show', spy);

                spy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Local cancellable show event', function () {
                // Set up spy with predetermined behaviour.
                var prevent = function(e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelShowEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(inlineDialog, 'show', cancelShowEventSpy);
                inlineDialog.show();
                offEvent(inlineDialog, 'show', cancelShowEventSpy);

                cancelShowEventSpy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Local hide event', function () {
                onEvent(inlineDialog, 'hide', spy);
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(inlineDialog, 'hide', spy);

                spy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Local cancellable hide event', function () {
                // Set up spy with predetermined behaviour.
                var prevent = function(e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelHideEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(inlineDialog, 'hide', cancelHideEventSpy);
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(inlineDialog, 'hide', cancelHideEventSpy);

                cancelHideEventSpy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Global show event', function () {
                onEvent(document, 'show', spy);
                inlineDialog.show();
                offEvent(document, 'show', spy);

                spy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.true;
            });

            it('Global multiple show event', function () {
                onEvent(document, 'show', spy);
                inlineDialog.show();
                inlineDialog.hide();
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(document, 'show', spy);

                spy.should.have.been.calledTwice;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Global cancellable show event', function () {
                // Set up spy with predetermined behaviour.
                var prevent = function(e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelShowEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(document, 'show', cancelShowEventSpy);
                inlineDialog.show();
                offEvent(document, 'show', cancelShowEventSpy);

                cancelShowEventSpy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Global hide event', function () {
                onEvent(document, 'hide', spy);
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(document, 'hide', spy);

                spy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Global multiple hide event', function () {
                onEvent(document, 'hide', spy);
                inlineDialog.show();
                inlineDialog.hide();
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(document, 'hide', spy);

                spy.should.have.been.calledTwice;
                expect(inlineDialog.isVisible()).to.be.false;
            });

            it('Global cancellable hide event', function () {
                // Set up spy with predetermined behaviour.
                var prevent = function(e) {
                    e.preventDefault();
                };
                var preventDefault = { prevent: function () {} };
                var cancelHideEventSpy = sinon.stub(preventDefault, 'prevent', prevent);

                onEvent(document, 'hide', cancelHideEventSpy);
                inlineDialog.show();
                inlineDialog.hide();
                offEvent(document, 'hide', cancelHideEventSpy);

                cancelHideEventSpy.should.have.been.calledOnce;
                expect(inlineDialog.isVisible()).to.be.true;
            });
        });
    });
});