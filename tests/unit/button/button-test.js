/* jshint expr:true */
define([
    'jquery',
    'aui/internal/skate',
    'aui/internal/spin',
    'aui/button',
    'aui-mocha'
], function ($, skate) {
    'use strict';
    var button;

    describe('Button - Basic Functionality -', function() {
        beforeEach(function() {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            button = $('<button class="aui-button"></button>').appendTo('#test-fixture').get(0);
            skate.init(button);
        });

        afterEach(function() {
            $(button).remove();
            $('#test-fixture').remove();
        });

        it('Button element has prototype', function () {
            expect(button.busy).to.be.a('function');
            expect(button.idle).to.be.a('function');
        });

        it('Calling busy should set aria-busy', function () {
            button.busy();

            expect(button.getAttribute('aria-busy')).to.equal('true');
        });

        it('Calling busy should add spin container inside button', function () {
            button.busy();
            expect(button.querySelectorAll('.aui-button-spinner').length).to.equal(1);
        });

        it('Calling busy twice should only add one spin container inside button', function () {
            button.busy();
            button.busy();
            expect(button.querySelectorAll('.aui-button-spinner').length).to.equal(1);
        });

        it('Calling idle should unset aria-busy', function () {
            button.busy();
            button.idle();

            expect(button.getAttribute('aria-busy')).to.equal('false');
        });

        it('Calling idle should remove spin container from inside button', function () {
            button.busy();
            button.idle();
            expect(button.querySelectorAll('.aui-button-spinner').length).to.equal(0);
        });

        it('Calling isBusy returns false initially', function () {
            expect(button.isBusy()).to.be.false;
        });

        it('Calling isBusy returns true when busy', function () {
            button.busy();
            expect(button.isBusy()).to.be.true;
        });

        it('Calling isBusy returns false when idled', function () {
            button.busy();
            button.idle();
            expect(button.isBusy()).to.be.false;
        });
    });
});