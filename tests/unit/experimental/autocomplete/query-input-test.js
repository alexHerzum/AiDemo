/* jshint expr:true */
define(['experimental-autocomplete/query-input', 'aui-mocha'], function () {
    'use strict';
    describe('Query input -', function () {
        var queryInput;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            var $input = $('<input/>', { 'id': 'my-thing'}).appendTo('#test-fixture');
            queryInput = new AJS.QueryInput({ el: $input });
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        describe('construction', function () {
            it('will attach element to query input', function () {
                expect(queryInput.$el.attr('id')).to.equal('my-thing');
            });
        });

        describe('changing values', function () {
            it('can retrieve input value', function () {
                expect(queryInput.val()).to.equal('');
            });

            it('can set input value', function () {
                var myval = 'foo';
                queryInput.val(myval);

                expect(queryInput.val()).to.equal(myval);
            });

            it('can listen for changes to the input value', function () {
                var myval = 'foo';
                var callback = sinon.spy();

                queryInput.val(myval);
                queryInput.bind('change', callback);
                queryInput.changed();

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(myval);
            });

            it('(BEHAVIOUR WILL CHANGE) will cause queryInput to fire a change event by the time keyup fires', function () {
                var myval = 'foo';
                var callback = sinon.spy();

                queryInput.val(myval);
                queryInput.bind('change', callback);
                queryInput.$el.trigger('keyup');

                callback.should.have.been.calledOnce;
                callback.should.have.been.calledWith(myval);
            });

            it('will only trigger a change event if input is actually changed', function () {
                var callback = sinon.spy();

                queryInput.bind('change', callback);
                queryInput.val('foo');
                queryInput.$el.trigger('keyup');
                queryInput.$el.trigger('keyup');

                callback.should.have.been.calledOnce;
            });

            it('will trigger a change event if input changes', function () {
                var callback = sinon.spy();

                queryInput.bind('change', callback);
                queryInput.val('foo');
                queryInput.$el.trigger('keyup');

                callback.should.have.been.calledOnce;

                queryInput.val('bar');
                queryInput.$el.trigger('keyup');

                callback.should.have.been.calledTwice;
            });
        });
    });
});