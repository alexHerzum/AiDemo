/* jshint expr:true */
define(['whenitype', 'aui-mocha'], function () {
    'use strict';
    describe('WhenIType Keyboard Shortcuts', function () {
        window.testResults = [];

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            // This is a hack caused by other tests not cleaning up properly
            // (probably dialog tests not removing global event handlers).
            if (!AJS.popup) {
                AJS.popup = {};
            }
            AJS.popup.current = null;
            // end hack
            window.testResults = [];
        });

        afterEach(function () {
            window.location.hash = '';
            $('#test-fixture').remove();
        });

        function pressKey (key, modifiers, eventName) {
            var event = AJS.$.Event(eventName || 'keypress');
            event.which = key.charCodeAt(0);
            event.ctrlKey = modifiers ? modifiers.control : false;
            event.metaKey = modifiers ? modifiers.meta : false;
            AJS.$(document).trigger(event);
        }

        it('for emacs', function () {

            // Shortcut keys shouldn't overlap, so testing abc and abcd together should have undefined results.
            var combinations = ['abc', 'dcba', 'zzz', 'p' , 'zabcdefghijklmnopqrstuwxy',
                // printable special keys should also be tested through the charCode code path
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.', '/', '[', ']', '-' ];

            AJS.$.each(combinations, function(idx, str) {
                AJS.whenIType.fromJSON([{
                    'keys':[str.split('')],
                    'context':'global',
                    'op':'execute',
                    'param':'testResults["' + idx + '"] = (testResults.hasOwnProperty("' + idx + '") ? testResults["' + idx + '"] : 0) + 1'
                }]);

                for (var i = 0; i < str.length; i++) {
                    var event = AJS.$.Event('keypress');
                    event.which = str.charCodeAt(i);
                    AJS.$(document).trigger(event);
                    if (i !== str.length-1) {
                        expect(window.testResults[idx], 'Keyboard combination "' + str + '" should not execute function until full string is ' +
                            'typed, not on letter "' + str.charAt(i) + '" (index: ' + i + ')').to.be.not.defined;
                    }
                }
                expect(window.testResults[idx]).to.equal(1);
            });
        });


        it('for special keys', function () {

            // We include a specifically unprintable character in these tests (left) to force whenIType to use the keydown event.
            // This is so we are testing the keyCode of the special and not the charCode.
            // For example:
            //   Typing the numpad '0' generates a keydown event with e.which === 96 (keyCode) and
            //   a keypress event with e.which === 48 (charCode)
            // The normal characters are tested via keypress in the emacs test.

            var specialKeys = {
                8: 'backspace', 9: 'tab', 13: 'return', 16: 'shift', 17: 'ctrl', 18: 'alt', 19: 'pause',
                20: 'capslock', 27: 'esc', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home',
                37: 'left', 38: 'up', 39: 'right', 40: 'down', 45: 'insert', 46: 'del',
                96: '0', 97: '1', 98: '2', 91: 'meta', 99: '3', 100: '4', 101: '5', 102: '6', 103: '7',
                104: '8', 105: '9', 106: '*', 107: '+', 109: '-', 110: '.', 111 : '/',
                112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8',
                120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12', 144: 'numlock', 145: 'scroll',
                188: ',', 190: '.', 191: '/', 224: 'meta', 219: '[', 221: ']'
            };

            var forceKeydownKey = 'left',
                forceKeydownKeycode = 37;

            // since we're not unbinding, each occurrance will trigger multiple shortcuts.
            // first only 1 is bound, then 2 are bound (3 hits total), then 3 are bound (6 hits total)...
            function custom(retArray, then) {
                return function () {
                    return retArray.length ? retArray.shift() : then;
                };
            }
            //these appear twice in the specials.
            var expectedCounts = {
                '.': custom([1,3], 3),
                '/': custom([1,3], 3),
                'meta': custom([1,3], 3)
            };
            var defaultCount = function () { return 1; };

            AJS.$.each(specialKeys, function(keyCode, name) {

                AJS.whenIType.fromJSON([{
                    'keys':[[forceKeydownKey, name]],
                    'context':'global',
                    'op':'execute',
                    'param':'testResults["' + name + '"] = (testResults.hasOwnProperty("' + name + '") ? testResults["' + name + '"] : 0) + 1'
                }]);

                var event = AJS.$.Event('keydown');
                event.which = forceKeydownKeycode;
                AJS.$(document).trigger(event);

                var event = AJS.$.Event('keyup');
                event.which = forceKeydownKeycode;
                AJS.$(document).trigger(event);

                var event = AJS.$.Event('keydown');
                event.which = keyCode;
                AJS.$(document).trigger(event);

                var event = AJS.$.Event('keyup');
                event.which = keyCode;
                AJS.$(document).trigger(event);

                var numExpected = (expectedCounts.hasOwnProperty(name) ? expectedCounts[name] : defaultCount)();
                expect(window.testResults[name]).to.equal(numExpected);
            });
        });

        it('can bind an array of keys', function () {
            var spy = sinon.spy();

            AJS.whenIType(['a', 'b']).execute(spy);
            pressKey('a');
            pressKey('b');

            spy.should.have.been.calledOnce;
        });

        it('for next / previous item', function () {
            AJS.$('#test-fixture').append('<p class="first item"></p>');
            AJS.$('#test-fixture').append('<p class="second item"></p>');
            AJS.$('#test-fixture').append('<p class="third item"></p>');

            AJS.whenIType('x').moveToNextItem('p');
            AJS.whenIType('y').moveToPrevItem('p');

            pressKey('x');
            expect(AJS.$('.focused.first').length).to.equal(1);
            pressKey('x');
            expect(AJS.$('.focused.second').length).to.equal(1);
            pressKey('x');
            expect(AJS.$('.focused.third').length).to.equal(1);

            pressKey('y');
            expect(AJS.$('.focused.second').length).to.equal(1);
            pressKey('y');
            expect(AJS.$('.focused.first').length).to.equal(1);
        });

        it('for going to a location', function () {
            AJS.whenIType('x').goTo('#foo');
            pressKey('x');
            expect(window.location.hash).to.equal('#foo');
        });

        it('for following a link', function () {
            AJS.$('#test-fixture').append('<a href="#foo" id="link-to-follow"></a>');
            AJS.whenIType('x').followLink('#link-to-follow');
            pressKey('x');
            expect(window.location.hash).to.equal('#foo');
        });

        it('for moving to and clicking', function () {
            AJS.$('#test-fixture').append('<p id="click-me"></p>');
            AJS.whenIType('x').moveToAndClick('#click-me');
            var callback = sinon.spy();
            AJS.$('#click-me').click(callback);

            pressKey('x');

            callback.should.have.been.calledOnce;
        });

        it('from JSON', function () {
            var json = [
                {
                    'keys':[['x']],
                    'context':'global',
                    'op':'goTo',
                    'param':'#x-pressed'
                },
                {
                    'keys':[['y']],
                    'context':'global',
                    'op':'goTo',
                    'param':'#y-pressed'
                }
            ];

            AJS.whenIType.fromJSON(json, true);

            pressKey('x');
            expect(window.location.hash).to.equal('#x-pressed');
            pressKey('y');
            expect(window.location.hash).to.equal('#y-pressed');
        });

        it('from JSON works with output from Atlassian shortcuts plugin', function () {
            var combinations = ['asd', 'hjkl'];

            AJS.$.each(combinations, function(idx, str) {
                AJS.whenIType.fromJSON([{
                    'keys':[str.split('')],
                    'context':'global',
                    'op':'execute',
                    'param':'testResults["' + idx + '"] = (testResults.hasOwnProperty("' + idx + '") ? testResults["' + idx + '"] : 0) + 1'
                }]);

                for (var i = 0; i < str.length; i++) {
                    var event = AJS.$.Event('keypress');
                    event.which = str.charCodeAt(i);
                    AJS.$(document).trigger(event);
                    if (i !== str.length-1) {
                        expect(window.testResults[idx], 'Keyboard combination "' + str + '" should not execute function until full string is ' +
                            'typed, not on letter "' + str.charAt(i) + '" (index: ' + i + ')').to.be.not.defined;
                    }
                }
                expect(window.testResults[idx]).to.equal(1);
            });
        });

        it('from JSON on mac', function () {
            var isMac = navigator.platform.indexOf('Mac') !== -1;
            if (!isMac) {
                expect(0);
                console.warn('Test skipped due to running in non mac environment');
                return;
            }

            var jsonNoTransform = [
                {
                    'keys':[['ctrl+a']],
                    'context':'global',
                    'op':'goTo',
                    'param':'#notransform'
                }
            ];

            AJS.whenIType.fromJSON(jsonNoTransform, false);

            pressKey('a', {control: false, meta: true}, 'keydown');
            expect(window.location.hash).to.not.equal('#notransform');


            pressKey('a', {control: true, meta: false}, 'keydown');
            expect(window.location.hash).to.equal('#notransform');
        });

        it('Shortcuts from JSON on mac, with meta to control key transformation', function () {
            var isMac = navigator.platform.indexOf('Mac') !== -1;
            if (!isMac) {
                expect(0);
                console.warn('Test skipped due to running in non mac environment');
                return;
            }

            var jsonTransform = [
                {
                    'keys':[['ctrl+c']],
                    'context':'global',
                    'op':'goTo',
                    'param':'#transform'
                }
            ];

            AJS.whenIType.fromJSON(jsonTransform, true);
            pressKey('c', {control: true, meta: false}, 'keydown');
            expect(window.location.hash).to.equal('');
            pressKey('c', {control: false, meta: true}, 'keydown');
            expect(window.location.hash).to.equal('#transform');
        });

        it('for shift keys', function () {

            var shiftNums = {
                '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(',
                '0': ')', '-': '_', '=': '+', '\'': '"', ';': ':', ',': '<', '.': '>', '/': '?', '\\': '|'
            };

            AJS.$.each(shiftNums, function(shiftChar, name) {

                AJS.whenIType.fromJSON([{
                    'keys':[[name]],
                    'context':'global',
                    'op':'execute',
                    'param':'testResults[\'' + name + '\'] = true'
                }]);

                var event = AJS.$.Event('keypress');
                event.which = shiftChar.charCodeAt(0);
                event.shiftKey = true;
                AJS.$(document).trigger(event);

                expect(window.testResults[name]).to.be.true;
            });
        });

        it('modifier keys', function () {
            var combinations = ['ctrl+c', 'ctrl+a', 'alt+a', 'meta+?', 'ctrl+?'];
            expect(combinations.length);

            AJS.$.each(combinations, function(index, keyCombo) {

                AJS.whenIType.fromJSON([{
                    'keys':[[keyCombo]],
                    'context':'global',
                    'op':'execute',
                    'param':'testResults["' + keyCombo + '"] = true'
                }]);

                var event = AJS.$.Event('keydown');

                var combination = keyCombo;

                while (combination.indexOf('+') !== -1) {
                    var modifier = combination.substring(0, combination.indexOf('+'));
                    event[modifier + 'Key'] = true;
                    combination = combination.replace(modifier + '+', '');
                }
                event.which = combination.charCodeAt(0);

                AJS.$(document).trigger(event);

                expect(window.testResults[keyCombo]);
            });
        });

        it('for multiple handlers bound', function () {
            var event,
                triggerSpy = sinon.spy();

            AJS.whenIType('a').execute(triggerSpy).execute(triggerSpy);
            event = AJS.$.Event('keypress');
            event.which = '65';
            AJS.$(document).trigger(event);
            triggerSpy.should.have.been.calledTwice;
        });

        it('unbinding', function () {

            var originalTitle = 'Some title () ) (';
            var shortcutsInTitle = ' (aui.keyboard.shortcut.type.xaui.keyboard.shortcut.or.x)';

            var $testDiv1 = $('<div class="test-one" title="Some title () ) ("/>');
            var $testDiv2 = $('<div class="test-two" title="Some title () ) ("/>');

            $('#test-fixture').append($testDiv1).append($testDiv2);

            var event,
                triggerSpy = sinon.spy(),
                shortcut = AJS.whenIType('x').or('a').execute(triggerSpy).click('.test-one');

            expect($testDiv1.attr('title')).to.equal(originalTitle + shortcutsInTitle);
            expect($testDiv2.attr('title')).to.equal(originalTitle);

            event = AJS.$.Event('keypress');
            event.which = '65';
            AJS.$(document).trigger(event);
            triggerSpy.should.have.been.calledOnce;

            shortcut.unbind();
            AJS.$(document).trigger(event);
            triggerSpy.should.have.been.calledOnce;

            expect($testDiv1.attr('title')).to.equal(originalTitle);
            expect($testDiv2.attr('title')).to.equal(originalTitle);
        });

        function makeModifierTest (modifier) {
            var neverCalledSpy;
            return function () {

                var combinations = ['c', '?', 'a'],
                    event;

                expect(combinations.length);

                AJS.$.each(combinations, function(index, key) {

                    neverCalledSpy = sinon.spy();
                    AJS.whenIType.fromJSON([{
                        'keys':[[key]],
                        'context':'global',
                        'op':'execute',
                        'param':'neverCalledSpy'
                    }]);

                    event = AJS.$.Event('keypress');
                    event[modifier + 'Key'] = true;
                    event.which = key.charCodeAt(0);
                    AJS.$(document).trigger(event);

                    neverCalledSpy.should.not.have.been.called;
                });
            };
        }

        it('for keys pressed with ctrl modifier should not execute', makeModifierTest('ctrl'));
        it('for keys pressed with alt modifier should not execute', makeModifierTest('alt'));
        it('for keys pressed with meta modifier should not execute', makeModifierTest('meta'));
    });
});