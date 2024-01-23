/* jshint expr:true */
define(['jquery', 'aui/internal/skate', 'aui/trigger', 'aui-mocha'], function ($, skate) {
    'use strict';
    describe('Trigger', function () {
        var element;
        var trigger;
        var disabledTrigger;
        var clock;
        var componentAttributeFlag = 'data-my-component';
        var componentId = 'my-element';

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        function click (trigger) {
            AJS.mocha.click(trigger);
        }

        function hover (trigger) {
            AJS.mocha.hover(trigger);
        }

        function focus (trigger) {
            var e = jQuery.Event('focus');
            $(trigger).trigger(e);
        }

        function createComponent () {
            return skate(componentAttributeFlag, {
                type: skate.types.ATTR,
                prototype: {
                    show: function () {
                        this.style.display = 'block';
                        this.dispatchEvent(new CustomEvent('aui-after-show'));
                    },
                    hide: function () {
                        this.style.display = 'none';
                        this.dispatchEvent(new CustomEvent('aui-after-hide'));
                    },
                    isVisible: function () {
                        return this.style.display === 'block';
                    }
                }
            });
        }

        function createElement () {
            var el = document.createElement('div');
            $(el)
                .text('some content')
                .attr('id', componentId)
                .attr(componentAttributeFlag, '')
                .addClass('aria-hidden', 'true')
                .css({
                    display: 'none',
                    height: 100,
                    width: 100
                })
                .appendTo('#test-fixture');
            skate.init(el);

            return el;
        }

        function triggerFactory (tag, type, attributes) {
            var el = document.createElement(tag);

            if (attributes && typeof attributes === 'object') {
                for(var prop in attributes) {
                    el.setAttribute(prop, attributes[prop]);
                }
            }

            el.setAttribute('data-aui-trigger', '');
            el.setAttribute('aria-controls', componentId);
            document.getElementById('test-fixture').appendChild(el);

            skate.init(el);

            return el;
        }

        function createButtonTrigger (type, attributes) {
            return triggerFactory('button', type, attributes);
        }

        function createAnchorTrigger (type, attributes) {
            return triggerFactory('a', type, attributes);
        }

        function disableTrigger (trigger) {
            trigger.setAttribute('aria-disabled', 'true');
            return trigger;
        }

        createComponent();
        describe('Behaviour -', function () {
            beforeEach(function () {
                element = createElement();

                element.message = sinon.spy();

                trigger = createButtonTrigger('toggle');
                disabledTrigger = disableTrigger(createButtonTrigger('toggle'));
                clock = sinon.useFakeTimers();
            });

            afterEach(function () {
                clock.restore();
            });

            it('isEnabled() should return false after aria-disabled="true" is added', function () {
                expect(trigger.isEnabled()).to.be.true;
                disableTrigger(trigger);
                expect(trigger.isEnabled()).to.be.false;
            });

            it('isEnabled() should return true when there is no aria-disabled attribute', function () {
                expect(trigger.isEnabled()).to.be.true;
            });

            it('disable() should disable the trigger', function () {
                expect(trigger.isEnabled()).to.be.true;
                trigger.disable();
                expect(trigger.isEnabled()).to.be.false;
            });

            it('enable() should enable the trigger', function () {
                expect(trigger.isEnabled()).to.be.true;
                trigger.disable();
                expect(trigger.isEnabled()).to.be.false;
                trigger.enable();
                expect(trigger.isEnabled()).to.be.true;
            });

            it('component should receive click message when trigger is clicked', function () {
                click(trigger);
                element.message.should.have.been.calledOnce;
                element.message.should.have.been.calledWith(sinon.match.has('type', 'click'));
            });

            it('component should receive hover message when trigger is hovered', function () {
                hover(trigger);
                element.message.should.have.been.calledOnce;
                element.message.should.have.been.calledWith(sinon.match.has('type', 'mouseover'));
            });

            it('component should receive focus message when trigger is focused', function () {
                focus(trigger);
                element.message.should.have.been.calledOnce;
                element.message.should.have.been.calledWith(sinon.match.has('type', 'focus'));
            });

            it('should not toggle when disabled trigger is clicked', function () {
                click(disabledTrigger);
                element.message.should.have.not.been.called;
            });

            it('should not toggle when disabled trigger is hovered', function () {
                hover(disabledTrigger);
                element.message.should.have.not.been.called;
            });

            it('should not toggle when disabled trigger is focused', function () {
                focus(disabledTrigger);
                element.message.should.have.not.been.called;
            });
        });

        describe('Elements -', function () {
            var dontCallMe;
            beforeEach(function () {
                element = createElement();
                element.message = sinon.spy();
                element.hide(); //make sure the element is hidden initially
                dontCallMe = sinon.stub().returns('Wait, no! Don\'t go :(');
                $(window).on('beforeunload', dontCallMe);
            });

            afterEach(function () {
                $(window).off('beforeunload', dontCallMe);
                if (trigger && trigger.remove) { trigger.remove(); }
            });

            it('if a trigger is an anchor, its hyperlink should not be followed', function () {
                trigger = createAnchorTrigger('toggle');
                trigger.setAttribute('href', 'http://google.com/');

                click(trigger);
                dontCallMe.should.have.not.been.called;
            });
        });
    });
});