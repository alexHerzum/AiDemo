/* jshint expr:true */
define(['focus-manager', 'aui-mocha'], function () {
    'use strict';
    describe('Focus Manager', function () {
        var $el,
            spy,
            $container,
            $el1,
            $el2,
            spy1,
            spy2;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        function createSingleInput () {
            $el = AJS.$('<input type="text" />').appendTo('#test-fixture');
            spy = sinon.spy();
        }

        function createTwoInputs () {
            $container = AJS.$('<div></div>').appendTo('#test-fixture');
            $el1 = AJS.$('<input type="text" />').appendTo($container);
            $el2 = AJS.$('<input type="text" />').appendTo($container);
            spy1 = sinon.spy();
            spy2 = sinon.spy();
        }

        function createSingleInputAndFocus () {
            createSingleInput();
            $el.focus(spy);
        }

        function createTwoInputsAndFocus () {
            createTwoInputs();
            $el1.focus(spy1);
            $el2.focus(spy2);
        }

        function createSingleInputAndBlur () {
            createSingleInput();
            $el.blur(spy);
        }

        function createTwoInputsAndBlur () {
            createTwoInputs();
            $el1.blur(spy1);
            $el2.blur(spy2);
        }

        it('enter() focuses on the first element only using the default selector', function () {
            createTwoInputsAndFocus();

            new AJS.FocusManager().enter($container);

            spy1.should.have.been.calledOnce;
            spy2.should.have.not.been.called;
        });

        it('enter() does not focus if data-aui-focus="false" is provided', function () {
            createTwoInputsAndFocus();

            $container.attr('data-aui-focus', 'false');
            new AJS.FocusManager().enter($container);

            spy1.should.have.not.been.called;
            spy2.should.have.not.been.called;
        });

        it('enter() does not focus if data-aui-focus="false" is provided and data-aui-focus-selector is present', function () {
            createTwoInputsAndFocus();
            $el2.attr('id', 'sideshow-bob');
            $container.attr('data-aui-focus', 'false');
            $container.attr('data-aui-focus-selector', '#sideshow-bob');

            new AJS.FocusManager().enter($container);

            spy1.should.have.not.been.called;
            spy2.should.have.not.been.called;
        });

        it('enter() focuses on the specified element using a custom selector', function () {
            createTwoInputsAndFocus();
            $el2.attr('id', 'sideshow-bob');
            $container.attr('data-aui-focus-selector', '#sideshow-bob');

            new AJS.FocusManager().enter($container);

            spy1.should.have.not.been.called;
            spy2.should.have.been.calledOnce;
        });

        it('enter() focuses on the first element only using a custom selector', function () {
            createTwoInputsAndFocus();
            $el2.attr('id', 'sideshow-bob');
            $container.attr('data-aui-focus-selector', ':input');

            new AJS.FocusManager().enter($container);

            spy1.should.have.been.calledOnce;
            spy2.should.have.not.been.called;
        });

        it('enter() selects passed element if it matches the focus selector', function () {
            createSingleInputAndFocus();

            new AJS.FocusManager().enter($el);

            spy.should.have.been.calledOnce;
        });

        it('exit() blurs the active element', function () {
            createTwoInputsAndBlur();
            $el1.focus();

            new AJS.FocusManager().exit($container);

            spy1.should.have.been.calledOnce;
        });

        it('exit() blurs the active element if the passed element is focussed', function () {
            createSingleInputAndBlur();
            $el.focus();

            new AJS.FocusManager().exit($el);

            spy.should.have.been.calledOnce;
        });

        it('exit() does not trigger blur on an element that is not underneath it', function () {
            createTwoInputsAndBlur();
            var $el = AJS.$('<input type="text" />').appendTo('#test-fixture');
            $el.focus();

            new AJS.FocusManager().exit($container);

            spy1.should.have.not.been.called;
            spy2.should.have.not.been.called;
        });

        it('preserves focus after enter() then exit()', function () {
            createTwoInputsAndBlur();
            var $focusButton = $('<button id="focusButton">Focus button</button>');
            AJS.$('#test-fixture').append($focusButton);
            $focusButton.focus();

            new AJS.FocusManager().enter($container);
            expect($focusButton.is(document.activeElement)).to.be.false;
            new AJS.FocusManager().exit($container);

            expect($focusButton.is(document.activeElement)).to.be.true;
        });
    });
});