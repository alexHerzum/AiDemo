/*jshint expr:true */
define(['event'], function () {
    'use strict';
    describe('Event', function () {
        it('Binding', function () {
            var spy = sinon.spy();
            AJS.bind('test1-event', spy);

            AJS.trigger('test1-event');

            spy.should.have.been.calledOnce;
        });

        it('Unbinding', function () {
            var spy = sinon.spy();
            AJS.bind('test2-event', spy);

            AJS.trigger('test2-event');
            spy.should.have.been.calledOnce;

            AJS.unbind('test2-event');
            AJS.trigger('test2-event');

            spy.should.have.been.calledOnce;
        });
    });
});