/* jshint expr:true */
define(['format', 'aui-mocha'], function () {
    'use strict';
    describe('Format Unit Tests - AJS.Format', function () {
        it('with 1 parameter', function () {
            var testFormat = AJS.format('hello {0}', 'world');
            expect(testFormat).to.equal('hello world');
        });

        it('with 2 parameters', function () {
            var testFormat = AJS.format('hello {0} {1}', 'world', 'again');
            expect(testFormat).to.equal('hello world again');
        });

        it('with 3 parameters', function () {
            var testFormat = AJS.format('hello {0} {1} {2}', 'world', 'again', '!');
            expect(testFormat).to.equal('hello world again !');
        });

        it('with 4 parameters', function () {
            var testFormat = AJS.format('hello {0} {1} {2} {3}', 'world', 'again', '!', 'test');
            expect(testFormat).to.equal('hello world again ! test');
        });

        it('with symbols', function () {
            var testFormat = AJS.format('hello {0}', '!@#$%^&*()');
            expect(testFormat).to.equal('hello !@#$%^&*()');
        });

        it('with curly braces', function () {
            var testFormat = AJS.format('hello {0}', '{}');
            expect(testFormat).to.equal('hello {}');
        });

        it('with repeated parameters', function () {
            var testFormat = AJS.format('hello {0}, {0}, {0}', 'world');
            expect(testFormat).to.equal('hello world, world, world');
        });

        it('with apostrophe', function () {
            var testFormat = AJS.format('hello \'{0}\' {0} {0}', 'world');
            expect(testFormat).to.equal('hello {0} world world');
        });

        it('with very long parameters', function () {
            var testFormat = AJS.format('hello {0}', 'this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long ');
            expect(testFormat).to.equal('hello this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long this parameter is very long ');
        });

        // choices
        it('with a choice value missing parameter', function () {
            var testFormat = AJS.format('We got {0,choice,0#|1#1 issue|1<{1,number} issues}');
            expect(testFormat).to.equal('We got ');
        });

        it('with a choice value with parameter lower first option', function () {
            var testFormat = AJS.format('We got {0,choice,0#0 issues|1#1|1<{1,number} issues}', -1, -1);
            expect(testFormat).to.equal('We got 0 issues');
        });

        it('with a choice value first option', function () {
            var testFormat = AJS.format('We got {0,choice,0#0 issues|1#1 issue|1<{0,number} issues}', 0);
            expect(testFormat).to.equal('We got 0 issues');
        });

        it('with a choice value middle option', function () {
            var testFormat = AJS.format('We got {0,choice,0#0 issues|1#1 issue|1<{0,number} issues}', 1);
            expect(testFormat).to.equal('We got 1 issue');
        });

        it('with a choice value last option', function () {
            var testFormat = AJS.format('We got {0,choice,0#0 issues|1#1 issue|1<{0,number} issues}', 2);
            expect(testFormat).to.equal('We got 2 issues');
        });

        it('with a choice value with missing number parameter option', function () {
            var testFormat = AJS.format('We got {0,choice,0# |1#1 issue|1<{1,number} issues}', 2);
            expect(testFormat).to.equal('We got  issues');
        });

        it('with a choice value with valid second option', function () {
            var testFormat = AJS.format('We got {0,choice,0# |1#1 issue|1<{1,number} issues}', 10, 10);
            expect(testFormat).to.equal('We got 10 issues');
        });

        // number
        it('with a number value', function () {
            var testFormat = AJS.format('Give me {0,number}!', 5);
            expect(testFormat).to.equal('Give me 5!');
        });

        it('with a number value', function () {
            var testFormat = AJS.format('Give me {0,number}!');
            expect(testFormat).to.equal('Give me !');
        });
    });

    describe('I18n Unit Tests AJS.I18n.getText', function () {
        afterEach(function () {
            if(AJS.I18n.keys) {
                delete AJS.I18n.keys;
            }
        });

        it('return key test', function () {
            expect(AJS.I18n.getText('test.key')).to.equal('test.key');
        });

        it('return value test', function () {
            AJS.I18n.keys = {
                'test.key': 'This is a Value'
            };
            expect(AJS.I18n.getText('test.key')).to.equal('This is a Value');
        });

        it('return value test', function () {
            AJS.I18n.keys = {
                'test.key': 'Formatting {0}, and {1}'
            };
            expect(AJS.I18n.getText('test.key', 'hello', 'world')).to.equal('Formatting hello, and world');
        });
    });
});
