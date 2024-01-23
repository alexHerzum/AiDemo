/* jshint expr:true */
define(['inline-dialog', 'aui-mocha'], function() {
    'use strict';
    describe('Inline Dialog Options -', function() {
        var layers = [];
        var $link;
        beforeEach(function() {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            $link = AJS.$('<div class="dialog-trigger"></div>').appendTo('#test-fixture');
        });

        afterEach(function() {
            layers.forEach(function(el) {
                el.remove();
            });
            $('#test-fixture').remove();
        });

        function createDialog(options) {
            var dialog;
            if (typeof options === 'undefined'){
                dialog = AJS.InlineDialog($link, 1, function(){});
            } else {
                dialog = AJS.InlineDialog($link, 1, function(){}, options);
            }
            layers.push(dialog);
            return dialog;
        }

        it('Creation', function() {
            var testInlineDialog = createDialog();
            expect(testInlineDialog).to.be.an('object');
            expect(testInlineDialog.show).to.be.a('function');
            expect(testInlineDialog.hide).to.be.a('function');
            expect(testInlineDialog.refresh).to.be.a('function');
        });

        it('getOptions function', function() {
            var testInlineDialog = createDialog();
            expect(testInlineDialog).to.be.an('object');
            expect(testInlineDialog.show).to.be.a('function');
            expect(testInlineDialog.hide).to.be.a('function');
            expect(testInlineDialog.refresh).to.be.a('function');
            expect(testInlineDialog.getOptions).to.be.a('function');
            expect(testInlineDialog.getOptions()).to.be.an('object');
        });

        it('default', function() {
            var testInlineDialog = createDialog();
            var expectedDefaults = {
                onTop: false,
                responseHandler: function(data, status, xhr) {
                    //assume data is html
                    return data;
                },
                closeOthers: true,
                isRelativeToMouse: false,
                addActiveClass: true,
                onHover: false,
                useLiveEvents: false,
                noBind: false,
                fadeTime: 100,
                persistent: false,
                hideDelay: 10000,
                showDelay: 0,
                width: 300,
                offsetX: 0,
                offsetY: 10,
                arrowOffsetX: 0,
                arrowOffsetY: 0,
                container: 'body',
                cacheContent : true,
                displayShadow: true,
                autoWidth: false,
                gravity: 'n',
                closeOnTriggerClick: false,
                preHideCallback: function () { return true; },
                hideCallback: function(){}, // if defined, this method will be exected after the popup has been faded out.
                initCallback: function(){}, // A function called after the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
                upfrontCallback: function() {}, // A function called before the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
                calculatePositions: function() {},
                getArrowPath: function() {},
                getArrowAttributes: function() {}
            };
            expect(testInlineDialog).to.be.an('object');
            var isDefault = true;
            AJS.$.each(testInlineDialog.getOptions(), function(index, value){
                if(expectedDefaults[index] !== value && typeof value !== 'function' || typeof value !== typeof expectedDefaults[index]){
                    isDefault = false;
                }
            });
            expect(isDefault).to.be.true;
        });

        it('displayShadow', function(){
            var testInlineDialog = createDialog({displayShadow: false});
            $link.click();

            var dialogNoShadow = testInlineDialog.find('.contents').hasClass('aui-inline-dialog-no-shadow');

            expect(dialogNoShadow).to.be.true;
        });

        it('autoWidth', function(){
            var testInlineDialog = createDialog({autoWidth: true});
            $link.click();

            var dialogAutoWidth = testInlineDialog.find('.contents').hasClass('aui-inline-dialog-auto-width');

            expect(dialogAutoWidth).to.be.true;
        });

        it('show with no options', function(){
            var testInlineDialog = createDialog();
            testInlineDialog.show();
            expect($(testInlineDialog).css('display')).to.equal('block');
        });
    });

    describe('Inline Dialog Positioning -', function() {
        var popup,
            trigger,
            mouse,
            opts,
            invoke;
        beforeEach(function() {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            popup = AJS.$('<div id="dummy-popup"><span class="arrow"/></div>')
                .css({'width': '200px', 'height': '100px'});

            trigger = AJS.$('<span id="dummy-trigger"/>')
                .appendTo(AJS.$('#test-fixture'))
                .css({'width': '200px', 'height': '20px', 'display': 'inline-block', 'position': 'fixed', 'left': '10px', 'top': '10px'});

            mouse = { x: 0, y: 0 };
            opts = { offsetX: 0, offsetY: 0, arrowOffsetX: 0 }; // Will get NaN unless these are supplied. wtf.

            invoke = function() {
                return AJS.InlineDialog.opts.calculatePositions(popup, { target: trigger }, mouse, opts);
            };
        });

        afterEach(function() {
            $('#test-fixture').remove();
        });

        it('Returns object with positioning information', function() {
            var result = invoke();
            expect(result).to.be.an('object');

            expect(result.popupCss).to.be.an('object');
            expect(result.popupCss.hasOwnProperty('left')).to.be.true;
            expect(result.popupCss.hasOwnProperty('right')).to.be.true;
            expect(result.popupCss.hasOwnProperty('top')).to.be.true;

            expect(result.arrowCss).to.be.an('object');
            expect(result.arrowCss.hasOwnProperty('left')).to.be.true;
            expect(result.arrowCss.hasOwnProperty('right')).to.be.true;
            expect(result.arrowCss.hasOwnProperty('top')).to.be.true;
        });

        it('Popup left-aligned with trigger\'s left edge when trigger is smaller', function() {
            trigger.width(100);
            trigger.css('left', 10);
            popup.width(200);

            var result = invoke();
            expect(result.popupCss.left).to.equal(10);
        });

        it('Popup centre-aligned to trigger\'s width when trigger is larger', function() {
            trigger.width(400);
            trigger.css('left', 10);
            opts.width = 200; // fixme: wtf, srsly
            popup.width(opts.width);

            var result = invoke();
            expect(result.popupCss.left).to.equal(110);
        });

        it('Popup cannot be positioned further than 10px from window\'s right edge when popup would cause horizontal scrollbars', function() {
            trigger.width(100);
            trigger.css({'left': 'auto', 'right': 10});
            popup.width(200);

            var result = invoke();
            expect(result.popupCss.left).to.equal('auto');
            expect(result.popupCss.right).to.equal(10);
        });

        it('Popup arrow points to middle of trigger when popup is left-aligned', function() {
            trigger.width(100);
            trigger.css('left', 10);
            popup.width(200);

            var result = invoke();
            expect(result.arrowCss.left).to.equal(50);
        });

        it('Popup arrow points to middle of trigger when popup is centre-aligned', function() {
            trigger.width(100);
            trigger.css('left', 10);
            popup.width(200);

            var result = invoke();
            expect(result.arrowCss.left).to.equal(50);
        });

        it('Popup arrow points to middle of trigger when popup is right-aligned', function() {
            trigger.width(100);
            trigger.css({'left': 'auto', 'right': 10});
            popup.width(200);

            var result = invoke();
            expect(result.arrowCss.left).to.equal(150);
            expect(result.arrowCss.right).to.equal('auto');
        });
    });

    describe('Inline Dialog Hiding -', function() {
        var clock,
            $link,
            $popupContainer,
            dialog;
        beforeEach(function() {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            clock = sinon.useFakeTimers();
            AJS.$.fx.off = true;
            $link = AJS.$('<div class="test-link"></div>').css('display', 'none');
            $popupContainer = AJS.$('<div class="popup-container"></div>');
            var $styles = AJS.$('<style type="text/css">.aui-inline-dialog { display: none; }</style>');
            AJS.$('#test-fixture').append($styles).append($link).append($popupContainer);
        });

        afterEach(function() {
            AJS.$.fx.off = false;
            clock.restore();
            $('#test-fixture').remove();
        });

        function createDialog(options) {
            var defaultOptions = {
                container: '.popup-container'
            };
            var renderPopupContent = function (content, trigger, showPopup) {
                showPopup();
            };
            dialog = AJS.InlineDialog($link, 1, renderPopupContent, AJS.$.extend({}, defaultOptions, options));
        }

        function renderDialog(options) {
            createDialog(options);
            dialog.show();
            clock.tick();
        }

        function pressEsc() {
            AJS.mocha.pressKey(AJS.keyCode.ESCAPE);
            clock.tick();
        }

        function dialogVisible() {
            return dialog.css('display') === 'block';
        }

        function dialogHidden() {
            return dialog.css('display') === 'none';
        }

        function clickLink() {
            _triggerEvent('click', 0);
        }

        function hoverLink() {
            _triggerEvent('mouseenter', 0);
        }

        function unhoverLink() {
            // 10000 is inline dialog default hideDelay
            _triggerEvent('mouseleave', 10000);
        }

        function _triggerEvent(eventName, delay) {
            var e = jQuery.Event(eventName);
            $link.trigger(e);
            clock.tick(delay);
        }

        it('Dialog show', function() {
            createDialog();
            dialog.show();
            clock.tick();

            expect(dialogVisible()).to.be.true;
        });

        it('is visible when the show event is triggered', function() {
            expect(2);

            createDialog();
            var isFirstShowLayerEvent = true;
            AJS.$(document).on('showLayer.showEventTest', function(e, type, dialog) {
                var isInlineDialogVisible = dialogVisible.call();
                if (isFirstShowLayerEvent) {
                    isFirstShowLayerEvent = false;
                    expect(isInlineDialogVisible).to.be.false;
                } else {
                    expect(isInlineDialogVisible).to.be.true;
                }
            });
            dialog.show();
            clock.tick();

            AJS.$(document).off('showLayer.showEventTest');
        });

        it('hides when escape is pressed', function() {
            renderDialog();
            expect(dialogVisible()).to.be.true;

            pressEsc();
            expect(dialogHidden()).to.be.true;
        });

        it('unregisters to keydown event when hidden', function() {
            expect(0);
            sinon.spy(AJS.$.prototype, 'off');
            renderDialog();
            pressEsc();

            sinon.assert.calledWith(AJS.$.prototype.off, 'keydown', sinon.match.func);
        });

        it('does not hide when esc is pressed and persistent is enabled', function() {
            renderDialog({persistent: true});
            pressEsc();

            expect(dialogVisible()).to.be.true;
        });

        it('does not hide when trigger clicked and closeOnTriggerClick is false', function() {
            renderDialog({
                closeOnTriggerClick: false
            });

            clickLink();

            expect(dialogVisible()).to.be.true;
        });

        it('hides when trigger clicked and closeOnTriggerClick is true', function() {
            renderDialog({
                closeOnTriggerClick: true
            });

            clickLink();

            expect(dialogVisible()).to.be.false;
        });

        it('does not show when trigger pressed if nobind is true', function() {
            renderDialog({
                noBind: true
            });
            clickLink();

            expect(dialogHidden()).to.be.true;
        });

        it('direct event binding (for click)', function() {
            createDialog();

            clickLink();
            expect(dialogVisible()).to.be.true;

            unhoverLink();
            expect(dialogHidden()).to.be.true;
        });

        it('direct event binding (for hover)', function() {
            createDialog({
                onHover: true
            });

            hoverLink();
            expect(dialogVisible()).to.be.true;

            unhoverLink();
            expect(dialogHidden()).to.be.true;
        });

        if (AJS.$.fn.live) {
            it('live event binding does not work for jQuery objects without a selector (for click)', function() {
                expect($link.selector).to.not.be.defined;
                // jQuery live events require $el.selector to exist, so this will fail
                createDialog({
                    useLiveEvents: true
                });

                clickLink();
                expect(dialogVisible()).to.be.false;
            });

            it('live event binding does not work for jQuery objects without a selector (for hover)', function() {
                expect($link.selector).to.not.be.defined;
                // jQuery live events require $el.selector to exist, so this will fail
                createDialog({
                    onHover: true,
                    useLiveEvents: true
                });

                hoverLink();
                expect(!dialogVisible()).to.be.true;
            });

            it('live event binding (for click)', function() {
                // jQuery live events require $el.selector to exist, so inline dialog can only work with jQuery objects that have a selector
                $link = AJS.$('.test-link');
                expect($link.selector).to.be.defined;
                createDialog({
                    useLiveEvents: true
                });

                clickLink();
                expect(dialogVisible()).to.be.true;

                unhoverLink();
                expect(dialogHidden()).to.be.true;
            });

            it('live event binding (for hover)', function() {
                // jQuery live events require $el.selector to exist, so inline dialog can only work with jQuery objects that have a selector
                $link = AJS.$('.test-link');
                expect($link.selector).to.not.be.defined;
                createDialog({
                    onHover: true,
                    useLiveEvents: true
                });

                hoverLink();

                expect(dialogVisible()).to.be.true;

                unhoverLink();
                expect(dialogHidden()).to.be.true;
            });
        }
    });
});