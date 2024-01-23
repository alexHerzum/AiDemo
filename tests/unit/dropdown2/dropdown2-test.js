/* jshint expr:true */
define(['dropdown2', 'soy/dropdown2', 'aui-mocha'], function () {
    'use strict';
    describe('Dropdown2', function () {
        var clock;
        function pressKey(keyCode) {
            var e = jQuery.Event('keydown');
            e.keyCode = keyCode;
            $(document).trigger(e);
            clock.tick(100);
        }

        describe('unit tests -', function () {
            var $trigger,
                $trigger2,
                $content,
                $content2,
                $hideout,
                $triggers,
                $contents;
            beforeEach(function () {
                $('<div id="test-fixture"></div>').appendTo(document.body);
                AJS.$('#test-fixture').html(
                        '<ul class="aui-dropdown2-trigger-group">' +
                        '<li>' +
                        '<a id="dropdown2-trigger" aria-owns="dropdown2-test" aria-haspopup="true" class="aui-dropdown2-trigger" href="#dropdown2-test" >Example dropdown</a>' +
                        '</li>' +
                        '<li>' +
                        '<a id="dropdown2-trigger2" aria-owns="dropdown2-test2" aria-haspopup="true" class="aui-dropdown2-trigger" href="#dropdown2-test2" >Example second dropdown</a>' +
                        '</li>' +
                        '</ul>' +
                        '<div id="dropdown2-test" class="aui-dropdown2"></div>' +
                        '<div id="dropdown2-test2" class="aui-dropdown2"></div>' +
                        '<div id="hideout"></div>'
                );
                $trigger = AJS.$('#dropdown2-trigger');
                $trigger2 = AJS.$('#dropdown2-trigger2');
                $triggers = [$trigger, $trigger2];
                $content = AJS.$('#dropdown2-test');
                $content2 = AJS.$('#dropdown2-test2');
                $contents = [$content, $content2];
                $hideout = AJS.$('#hideout');

                clock = sinon.useFakeTimers();
            });

            afterEach(function () {
                clock.restore();

                $trigger.remove();
                $trigger2.remove();
                $content.remove();
                $content2.remove();
                $hideout.remove();
                $('#test-fixture').remove();
            });

            function simulateTriggerClick(num) {
                $triggers[(num || 0)].click();
            }

            function simulateTriggerHover(num) {
                var e = jQuery.Event('mousemove');
                $triggers[(num || 0)].trigger(e);
                clock.tick(0);
            }

            function invokeTrigger () {
                $trigger.trigger('aui-button-invoke');
                clock.tick(100);
            }

            function simulateItemClick($item) {
                $item.trigger('click');
            }

            function triggerIsActive(num) {
                return $triggers[(num || 0)].is('.active,.aui-dropdown2-active');
            }

            function item(itemId, num) {
                return $contents[(num || 0)].find('#' + itemId);
            }

            function addPlainSection() {
                AJS.$('#section1').remove();
                AJS.$('#dropdown2-test').append(
                        '<div id="section1" class="aui-dropdown2-section">' +
                        '<ul>' +
                        '<li><a id="item1">Menu item</a></li>' +
                        '<li><a id="item2">Menu item</a></li>' +
                        '<li><a id="item3">Menu item</a></li>' +
                        '<li><a id="item4">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            function addPlainSection2() {
                AJS.$('#section12').remove();
                AJS.$('#dropdown2-test2').append(
                        '<div id="section12" class="aui-dropdown2-section">' +
                        '<ul>' +
                        '<li><a id="item12">Menu item</a></li>' +
                        '<li><a id="item22">Menu item</a></li>' +
                        '<li><a id="item32">Menu item</a></li>' +
                        '<li><a id="item42">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            function addRadioSection() {
                AJS.$('#section2').remove();
                AJS.$('#dropdown2-test').append(
                        '<div id="section2" class="aui-dropdown2-section">' +
                        '<ul role="radiogroup">' +
                        '<li><a id="radio1-unchecked" class="aui-dropdown2-radio interactive aui-dropdown2-interactive">Menu item</a></li>' +
                        '<li><a id="radio2-checked" class="aui-dropdown2-radio interactive aui-dropdown2-interactive checked">Menu item</a></li>' +
                        '<li><a id="radio3-unchecked" class="aui-dropdown2-radio interactive aui-dropdown2-interactive">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            function addHiddenSection() {
                AJS.$('#section3').remove();
                AJS.$('#dropdown2-test').append(
                        '<div id="section3" class="aui-dropdown2-section">' +
                        '<ul>' +
                        '<li class="aui-dropdown2-hidden"><a id="hidden1-unchecked-disabled" class="aui-dropdown2-checkbox interactive disabled" >Menu item</a></li>' +
                        '<li class="aui-dropdown2-hidden"><a id="hidden2-checked" class="aui-dropdown2-checkbox interactive aui-dropdown2-checked">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            function addInteractiveSection() {
                AJS.$('#section4').remove();
                AJS.$('#dropdown2-test').append(
                        '<div id="section4" class="aui-dropdown2-section">' +
                        '<ul role="radiogroup">' +
                        '<li><a id="iradio1-interactive-checked" class="aui-dropdown2-radio interactive aui-dropdown2-interactive checked">Menu item</a></li>' +
                        '<li><a id="iradio2-interactive-unchecked" class="aui-dropdown2-radio interactive">Menu item</a></li>' +
                        '<li><a id="iradio3-unchecked" class="aui-dropdown2-radio">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            function addCheckboxSection() {
                AJS.$('#section5').remove();
                AJS.$('#dropdown2-test').append(
                        '<div id="section5" class="aui-dropdown2-section">' +
                        '<ul>' +
                        '<li><a id="check1-unchecked" class="aui-dropdown2-checkbox interactive">Menu item</a></li>' +
                        '<li><a id="check2-checked" class="aui-dropdown2-checkbox interactive checked">Menu item</a></li>' +
                        '<li><a id="check3-unchecked" class="aui-dropdown2-checkbox interactive">Menu item</a></li>' +
                        '</ul>' +
                        '</div>'
                );
            }

            // Testing opening and closing by triggering invoke
            it('Dropdown2 aui-button-invoke opens dropdown', function () {
                addPlainSection();
                invokeTrigger();

                expect(triggerIsActive()).to.be.true;
            });

            it('Dropdown2 aui-button-invoke closes dropdown', function () {
                addPlainSection();

                invokeTrigger();
                invokeTrigger();

                expect(triggerIsActive()).to.be.false;
            });

            it('Dropdown2 does not open when disabled', function () {
                addPlainSection();
                $trigger.attr('aria-disabled','true');

                simulateTriggerClick();

                expect(triggerIsActive()).to.be.false;
            });

            // Testing key navigation
            it('Dropdown2 navigated correctly using keys', function () {
                addPlainSection();
                simulateTriggerClick();

                pressKey(AJS.keyCode.DOWN);

                var $i1 = item('item1'),
                    $i2 = item('item2');

                expect(triggerIsActive()).to.be.true;
                expect($i1.is('.aui-dropdown2-active')).to.be.false;
                expect($i2.is('.aui-dropdown2-active')).to.be.true;
            });

            it('Dropdown2 navigated correctly using keys with hidden items', function () {
                addPlainSection();

                var $i1 = item('item1'),
                    $i2 = item('item2'),
                    $i3 = item('item3'),
                    $i4 = item('item4');

                $i1.parent().addClass('hidden');
                $i3.parent().addClass('hidden');

                simulateTriggerClick();
                pressKey(AJS.keyCode.DOWN);

                expect($i2.is('.aui-dropdown2-active')).to.be.false;
                expect($i4.is('.aui-dropdown2-active')).to.be.true;
            });

            it('Dropdown2 navigated correctly using keys with hidden items that were added after opened', function () {
                addPlainSection();

                var $i1 = item('item1'),
                    $i2 = item('item2'),
                    $i3 = item('item3'),
                    $i4 = item('item4');

                $i1.parent().addClass('hidden');

                simulateTriggerClick();
                $i3.attr('aria-disabled','true').addClass('disabled').parent().addClass('hidden');
                pressKey(AJS.keyCode.DOWN);

                expect($i2.is('.aui-dropdown2-active')).to.be.false;
                expect($i4.is('.aui-dropdown2-active')).to.be.true;
            });

            // --- Testing Events ---
            // Show Events
            it('Dropdown2 fires aui-dropdown2-show when it is shown by click', function () {
                addPlainSection();

                var spy = sinon.spy();
                $content.on('aui-dropdown2-show', spy);

                simulateTriggerClick();

                spy.should.have.been.calledOnce;
            });

            it('Dropdown2 fires aui-dropdown2-show when it is shown by invoke', function () {
                addPlainSection();

                var spy = sinon.spy();
                $content.on('aui-dropdown2-show', spy);

                invokeTrigger();

                spy.should.have.been.calledOnce;
            });

            // Hide Events
            it('Dropdown2 fires aui-dropdown2-hide when it is hidden by click', function () {
                addPlainSection();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-hide', spy);

                clock.tick(1000);
                simulateTriggerClick();
                clock.tick(1000);
                simulateTriggerClick();
                clock.tick(1000);

                spy.should.have.been.calledOnce;
            });

            it('Dropdown2 fires aui-dropdown2-hide when it is hidden by invoke', function () {
                addPlainSection();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-hide', spy);

                simulateTriggerClick();
                invokeTrigger();

                spy.should.have.been.calledOnce;
            });

            // Check and uncheck Events on checkboxes and radios
            it('Dropdown2 fires aui-dropdown2-item-check on checkboxes', function () {
                addCheckboxSection();
                simulateTriggerClick();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-item-check', spy);

                var $c1 = item('check1-unchecked'),
                    $c2 = item('check2-checked'),
                    $c3 = item('check3-unchecked');

                simulateItemClick($c1);
                simulateItemClick($c2);
                simulateItemClick($c3);

                spy.should.have.been.calledTwice;
            });

            it('Dropdown2 fires aui-dropdown2-item-uncheck on checkboxes', function () {
                addCheckboxSection();
                simulateTriggerClick();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-item-uncheck', spy);

                var $c1 = item('check1-unchecked'),
                    $c2 = item('check2-checked'),
                    $c3 = item('check3-unchecked');

                simulateItemClick($c1);
                simulateItemClick($c2);
                simulateItemClick($c3);

                spy.should.have.been.calledOnce;
            });

            it('Dropdown2 fires aui-dropdown2-item-check on radios', function () {
                addRadioSection();
                simulateTriggerClick();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-item-check', spy);

                var $r1 = item('radio1-unchecked'),
                    $r2 = item('radio2-checked'),
                    $r3 = item('radio3-unchecked');

                simulateItemClick($r2);
                simulateItemClick($r1);
                simulateItemClick($r3);

                spy.should.have.been.calledTwice;
            });

            it('Dropdown2 fires aui-dropdown2-item-uncheck on radios', function () {
                addRadioSection();
                simulateTriggerClick();
                var spy = sinon.spy();
                $content.on('aui-dropdown2-item-check', spy);

                var $r1 = item('radio1-unchecked'),
                    $r2 = item('radio2-checked'),
                    $r3 = item('radio3-unchecked');

                simulateItemClick($r1);
                simulateItemClick($r2);
                simulateItemClick($r3);

                spy.should.have.been.calledThrice;
            });

            // Hide location
            it('Dropdown2 returned to original location if data-dropdown2-hide-location is not specified', function () {
                addPlainSection();
                var $hideParent = $content.parent()[0];

                simulateTriggerClick();
                clock.tick(100);
                simulateTriggerClick();
                clock.tick(100);

                expect($content.parent()[0]).to.be.equal($hideParent);
                expect($hideout.find($content).length ).to.be.equal(0);
            });

            it('Dropdown2 specifying the data-dropdown2-hide-location works properly when dropdown is hidden', function () {
                addPlainSection();
                $trigger.attr('data-dropdown2-hide-location', 'hideout');
                var $originalParent = $content.parent()[0];

                simulateTriggerClick();
                clock.tick(100);
                simulateTriggerClick();
                clock.tick(100);

                expect($content.parent()[0]).to.not.be.equal($originalParent);
                expect($hideout.find($content).length).to.be.equal(1);
            });

            it('Dropdown2 in aui-dropdown2-trigger-group open on click correctly one dropdown', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerClick();
                clock.tick(100);

                expect(triggerIsActive()).to.be.true;
                expect(triggerIsActive(1)).to.be.false;
            });

            it('Dropdown2 in aui-dropdown2-trigger-group open on click correctly multiple dropdowns', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerClick();
                clock.tick(100);
                simulateTriggerClick(1);
                clock.tick(100);

                expect(triggerIsActive()).to.be.false;
                expect(triggerIsActive(1)).to.be.true;
            });

            it('Dropdown2 in aui-dropdown2-trigger-group open on hover after one is clicked', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerClick();
                clock.tick(100);
                simulateTriggerHover(1);

                expect(triggerIsActive()).to.be.false;
                expect(triggerIsActive(1)).to.be.true;
            });

            it('Dropdown2 in aui-dropdown2-trigger-group does not open on over when one not clicked', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerHover(1);

                expect(triggerIsActive()).to.be.false;
                expect(triggerIsActive(1)).to.be.false;
            });

            it('Dropdown2 in aui-dropdown2-trigger-group key navigation up down after one is clicked', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerClick();
                clock.tick(100);

                pressKey(AJS.keyCode.DOWN);

                var $i1 = item('item1'),
                    $i2 = item('item2');

                expect(triggerIsActive()).to.be.true;
                expect($i1.is('.aui-dropdown2-active')).to.be.false;
                expect($i2.is('.aui-dropdown2-active')).to.be.true;
            });

            it('Dropdown2 in aui-dropdown2-trigger-group key navigation left right after one is clicked', function () {
                addPlainSection();
                addPlainSection2();

                simulateTriggerClick();
                clock.tick(100);

                pressKey(AJS.keyCode.RIGHT);
                clock.tick(100);
                pressKey(AJS.keyCode.DOWN);
                clock.tick(100);

                var $i12 = item('item12', 1),
                    $i22 = item('item22', 1);

                expect(triggerIsActive()).to.be.false;
                expect(triggerIsActive(1)).to.be.true;
                expect($i12.is('.aui-dropdown2-active')).to.be.false;
                expect($i22.is('.aui-dropdown2-active')).to.be.true;
            });

            it('Dropdown2 adds aui-dropdown2-active and active to trigger on click', function () {
                addPlainSection();
                simulateTriggerClick();

                expect($trigger.is('.aui-dropdown2-active')).to.be.true;
                expect($trigger.is('.active')).to.be.true;
            });

            it('Dropdown2 adds aui-dropdown2-checked on click checkboxes', function () {
                addCheckboxSection();
                simulateTriggerClick();

                var $c1 = item('check1-unchecked');

                simulateItemClick($c1);

                expect($c1.is('.checked.aui-dropdown2-checked')).to.be.true;
            });

            it('Dropdown2 toggles checked to unchecked on checkboxes', function () {
                addCheckboxSection();
                simulateTriggerClick();

                var $c1 = item('check1-unchecked'),
                    $c2 = item('check2-checked');

                simulateItemClick($c1);
                simulateItemClick($c2);

                expect($c1.is('.checked.aui-dropdown2-checked')).to.be.true;
                expect($c2.is('.checked,.aui-dropdown2-checked')).to.be.false;
            });

            it('Dropdown2 adds aui-dropdown2-checked on click radio buttons', function () {
                addRadioSection();
                simulateTriggerClick();

                var $r3 = item('radio3-unchecked');

                simulateItemClick($r3);

                expect($r3.is('.checked.aui-dropdown2-checked')).to.be.true;
            });

            it('Dropdown2 toggles checked to unchecked on radio buttons', function () {
                addRadioSection();
                simulateTriggerClick();

                var $r1 = item('radio1-unchecked'),
                    $r2 = item('radio2-checked');

                simulateItemClick($r1);

                expect($r1.is('.checked.aui-dropdown2-checked')).to.be.true;
                expect($r2.is('.checked,.aui-dropdown2-checked')).to.be.false;
            });

            it('Dropdown2 adds aui-dropdown2-disabled to hidden item - li.hidden > a', function () {
                addHiddenSection();
                simulateTriggerClick();

                var $h2 = item('hidden2-checked');

                expect($h2.is('.disabled.aui-dropdown2-disabled')).to.be.true;
            });

            it('Dropdown2 adds aui-dropdown2-disabled to hidden and disabled item - li.hidden > a', function () {
                addHiddenSection();
                simulateTriggerClick();

                var $h1 = item('hidden1-unchecked-disabled');

                expect($h1.is('.disabled.aui-dropdown2-disabled')).to.be.true;
            });

            it('Dropdown2 cannot click aui-dropdown2-disabled', function () {
                addHiddenSection();
                simulateTriggerClick();

                var $h1 = item('hidden1-unchecked-disabled'),
                    $h2 = item('hidden2-checked');

                simulateItemClick($h1);
                simulateItemClick($h2);

                expect($h1.is('.checked.aui-dropdown2-checked')).to.be.false;
                expect($h2.is('.aui-dropdown2-checked')).to.be.true;
            });

            it('Dropdown2 aui-dropdown2-interactive doesnt hide on click', function () {
                addInteractiveSection();
                simulateTriggerClick();

                var $ir1 = item('iradio1-interactive-checked'),
                    $ir2 = item('iradio2-interactive-unchecked');

                simulateItemClick($ir1);
                simulateItemClick($ir2);
                clock.tick(100);

                expect(triggerIsActive()).to.be.true;
            });

            it('Dropdown2 not aui-dropdown2-interactive hides on click', function () {
                addInteractiveSection();
                simulateTriggerClick();

                var $ir3 = item('iradio3-unchecked');

                simulateItemClick($ir3);
                clock.tick(100);

                expect(triggerIsActive()).to.be.false;
            });
        });

        describe('sub-menu tests -', function () {
            beforeEach(function () {
                AJS.$('body').append(
                        '<ul id="dd2-ul" class="aui-dropdown2-trigger-group">' +
                        '<li>' +
                        '<a id="dd2-trigger" href="#dd2-menu" aria-owns="dd2-menu-1" aria-haspopup="true" class="aui-dropdown2-trigger aui-style-default" aria-controls="dd2-menu">Open dropdown</a>' +
                        '<div id="dd2-menu-1" class="aui-dropdown2 aui-style-default" aria-hidden="true">' +
                        '<ul class="aui-list-truncate">' +
                        '<li>' +
                        '<a id="dd2-menu-1-child-1">Dummy item 1</a>' +
                        '<a id="dd2-menu-1-child-2" href="#dd2-submenu-1" aria-owns="dd2-menu-2" aria-haspopup="true" class="interactive aui-dropdown2-sub-trigger aui-style-default" aria-controls="dd2-menu-2">Open submenu level 1</a>' +
                        '<div id="dd2-menu-2" class="aui-dropdown2 aui-style-default aui-dropdown2-sub-menu" aria-hidden="true">' +
                        '<ul class="aui-list-truncate">' +
                        '<li>' +
                        '<a id="dd2-menu-2-child-1" class="">Dummy item 2</a>' +
                        '<a id="dd2-menu-2-child-2" href="#dd2-menu-3" aria-owns="dd2-menu-3" aria-haspopup="true" class="interactive aui-dropdown2-sub-trigger aui-style-default" aria-controls="dd2-menu-3">Open submenu level 2</a>' +
                        '<div id="dd2-menu-3" class="aui-dropdown2 aui-style-default aui-dropdown2-sub-menu" aria-hidden="true">' +
                        '<ul class="aui-list-truncate">' +
                        '<li>' +
                        '<a>Final level</a>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</li>' +
                        '</ul>'
                );

                clock = sinon.useFakeTimers();
            });

            afterEach(function () {
                AJS.$('#dd2-ul').remove();
                AJS.$('#dd2-menu-1').remove();
                AJS.$('#dd2-menu-2').remove();
                AJS.$('#dd2-menu-3').remove();
                clock.restore();
            });

            function getMenuItem(level, child) {
                var selector = '#dd2-menu-' + level + '-child-' + child;
                return AJS.$(selector);
            }

            function getFirstMenuTrigger() {
                return AJS.$('#dd2-trigger');
            }

            function getSecondMenuTrigger() {
                return getMenuItem(1, 2);
            }

            function getThirdMenuTrigger() {
                return getMenuItem(2, 2);
            }

            function invokeTrigger($el) {
                $el.trigger('aui-button-invoke');
                clock.tick(100);
            }

            function hoverOver($el) {
                $el.mousemove();
                clock.tick(100);
            }

            function clickOnDocument() {
                AJS.$(document).click();
                clock.tick(100);
            }

            function openAllMenus() {
                var $firstMenuTrigger = getFirstMenuTrigger();
                var $secondMenuTrigger = getSecondMenuTrigger();
                var $thirdMenuTrigger = getThirdMenuTrigger();

                invokeTrigger($firstMenuTrigger);
                invokeTrigger($secondMenuTrigger);
                invokeTrigger($thirdMenuTrigger);

                clock.tick(100);
            }

            function countOpenDropdowns() {
                return AJS.$('.aui-dropdown2[aria-hidden=false]').length;
            }

            it('Dropdown2 with submenus opens first menu', function () {
                var $trigger = getFirstMenuTrigger();
                $trigger.click();
                expect($trigger.hasClass('active')).to.be.true;
            });

            it('Dropdown2 submenus can be opened', function () {
                var $firstMenuTrigger = getFirstMenuTrigger();
                var $secondMenuTrigger = getSecondMenuTrigger();
                var $secondMenuFirstChild = getMenuItem(2, 1);

                invokeTrigger($firstMenuTrigger);
                invokeTrigger($secondMenuTrigger);

                expect($secondMenuTrigger.hasClass('active')).to.be.true;
                expect($secondMenuFirstChild.hasClass('active')).to.be.true;
            });

            it('Escape closes one submenu at a time', function () {
                openAllMenus();

                expect(countOpenDropdowns()).to.equal(3);
                pressKey(AJS.keyCode.ESCAPE);
                expect(countOpenDropdowns()).to.equal(2);
                pressKey(AJS.keyCode.ESCAPE);
                expect(countOpenDropdowns()).to.equal(1);
                pressKey(AJS.keyCode.ESCAPE);
                expect(countOpenDropdowns()).to.equal(0);
            });

            it('Clicking on the document closes all submenus', function () {
                openAllMenus();
                expect(countOpenDropdowns()).to.equal(3);
                clickOnDocument();
                expect(countOpenDropdowns()).to.equal(0);
            });

            it('Expanding submenus via the keyboard works', function () {
                var $trigger = getFirstMenuTrigger();
                $trigger.click();
                pressKey(AJS.keyCode.DOWN);
                pressKey(AJS.keyCode.RIGHT);
                expect(countOpenDropdowns()).to.equal(2);
                pressKey(AJS.keyCode.DOWN);
                pressKey(AJS.keyCode.RIGHT);
                expect(countOpenDropdowns()).to.equal(3);
            });

            it('Pressing right from a non trigger does not open a dropdown', function () {
                var $trigger = getFirstMenuTrigger();
                $trigger.click();
                pressKey(AJS.keyCode.RIGHT);
                expect(countOpenDropdowns()).to.equal(1);
            });

            it('Pressing left from any position in a dropdown closes the submenu', function () {
                openAllMenus();
                pressKey(AJS.keyCode.LEFT);

                expect(countOpenDropdowns()).to.equal(2);

                pressKey(AJS.keyCode.UP);
                pressKey(AJS.keyCode.LEFT);

                expect(countOpenDropdowns()).to.equal(1);
            });

            it('The last menu cannot be closed by the arrow keys', function () {
                var $trigger = getFirstMenuTrigger();
                $trigger.click();

                pressKey(AJS.keyCode.UP);
                pressKey(AJS.keyCode.DOWN);
                pressKey(AJS.keyCode.LEFT);
                pressKey(AJS.keyCode.RIGHT);

                expect(countOpenDropdowns()).to.be.at.least(1);
            });

            it('Dropdown2 submenus can be opened by hovering', function () {
                var $trigger = getFirstMenuTrigger();
                $trigger.click();

                hoverOver(getMenuItem(1,2));
                hoverOver(getMenuItem(2,2));

                expect(countOpenDropdowns()).to.equal(3);

                hoverOver(getMenuItem(1,1));

                expect(countOpenDropdowns()).to.equal(1);
            });
        });
    });
});