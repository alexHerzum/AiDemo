/* jshint expr:true */
define(['jquery', 'aui/internal/skate', 'aui/form-notification', 'aui-mocha'], function ($, skate) {
    'use strict';
    describe('Form notification Unit Tests -', function () {
        var clock;

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            clock = sinon.useFakeTimers();
        });

        afterEach(function () {
            $('.tipsy').remove();
            clock.restore();
            $('#test-fixture').remove();
        });

        function createInput (attributes) {
            var $input = AJS.$('<input type="text">');
            attributes = $.extend({}, attributes, {'data-aui-notification-field': ''});
            $.each(attributes, function(key, value){
                $input.attr(key, value);
            });
            $('#test-fixture').append($input);
            skate.init($input);
            return $input;
        }

        function countTipsysOnPage () {
            return $('.tipsy').length;
        }

        function firstTipsyOnPage () {
            return $('.tipsy').first();
        }

        function setupLinkEnvironment () {
            return createInput({
                'data-aui-notification-info': '["Some text here followed by a link <a href="http://google.com/">click here</a>"]'
            });
        }

        it('Fields can receive notifications', function () {
            var $input = createInput({
                'data-aui-notification-info': 'Test info message'
            });

            expect(countTipsysOnPage()).to.equal(0);
            $input.focus();
            expect(countTipsysOnPage()).to.equal(1);
        });

        it('Field notifications receive correct notification class', function () {
            var $input = createInput({
                'data-aui-notification-error': 'Test error message'
            });
            $input.focus();
            expect($('.aui-form-notification-tooltip-error').length).to.equal(1);
            expect($('.aui-form-notification-tooltip-info').length).to.equal(0);
        });

        it('Field notification messages stack correctly', function () {
            var $input = createInput({
                'data-aui-notification-info': '["Test JSON message 1","Test JSON message 2"]'
            });
            $input.focus();
            expect($('.tipsy-inner')[0].innerHTML.indexOf('<li>')).to.not.equal(-1);
        });

        it('There is only one tooltip on the page after focusing multiple', function () {
            var $input1 = createInput({
                'data-aui-notification-info': 'The first message'
            });

            var $input2 = createInput({
                'data-aui-notification-info': 'The second message'
            });
            expect(countTipsysOnPage()).to.equal(0);
            $input1.focus();
            expect(countTipsysOnPage()).to.equal(1);
            $input1.blur();
            $input2.focus();
            expect(countTipsysOnPage()).to.equal(1);

        });

        it('Field notification links are followed', function () {
            var $input = setupLinkEnvironment();
            var pageRedirectSpy = sinon.stub();
            $(window).on('beforeunload', pageRedirectSpy);

            $input.focus();
            expect(countTipsysOnPage()).to.equal(1);

            $('a').first()[0].dispatchEvent(new CustomEvent('click', {
                cancelable: true
            }));

            pageRedirectSpy.should.have.been.calledOnce;
        });

        it('Notification states can be changed after a field is created', function(done) {
            expect(1);
            var $input = createInput({
                'data-aui-notification-info': 'Test info message'
            });

            $input.focus();
            $input.attr('data-aui-notification-error', 'Test error message');

            setTimeout(function () {
                expect($('.aui-form-notification-tooltip-error').length).to.equal(1);
                done();
            }, 1);
        });

        it('Clicking on the notification when the field is focused keeps the notification open', function () {
            var $input = setupLinkEnvironment();
            $input.focus();
            var $tipsy = firstTipsyOnPage();
            $tipsy.click();
            expect(countTipsysOnPage()).to.equal(1);
        });

        it('Tooltips are unaffected by blur when not on inputs', function () {
            var $nonInput = $('<div data-aui-notification-field="" data-aui-notification-info="Basic message"/>');
            $('#test-fixture').append($nonInput);
            skate.init($nonInput);

            expect(countTipsysOnPage()).to.equal(1);
            $nonInput.focus();
            $nonInput.blur();

            expect(countTipsysOnPage()).to.equal(1);
        });

        it('Text input field tooltips become visible / invisible after switching between fields', function () {
            var $input1 = createInput({
                'data-aui-notification-info': 'This is the first input'
            });
            var $input2 = createInput({
                'data-aui-notification-info': 'This is the second input'
            });

            expect(countTipsysOnPage()).to.equal(0);
            $input1.focus();
            expect(countTipsysOnPage()).to.equal(1);
            $input2.focus();
            expect(countTipsysOnPage()).to.equal(1);
        });
    });
});
