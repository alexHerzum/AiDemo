/* jshint expr:true */
define([
    'underscore',
    'backbone',
    'experimental-autocomplete/progressive-data-set',
    'experimental-autocomplete/query-result',
    'aui-mocha'
], function (
    _,
    Backbone,
    ProgressiveDataSet
) {
    'use strict';
    describe('ResultsList -', function () {
        var ds,
            resultview;
        beforeEach(function () {
            ds = new ProgressiveDataSet();
            resultview = new AJS.ResultsList({ source: ds });
        });

        it('#size', function () {
            ds.trigger('respond', { results: [new Backbone.Model()] });
            expect(resultview.size()).to.equal(1);

            ds.trigger('respond', { results: [] });
            expect(resultview.size()).to.equal(0);
        });

        it('clicking a result item triggers a "select" event', function () {
            var model = new Backbone.Model({id:'foo'});
            var selectEventSpy = sinon.spy();

            resultview.bind('selected', selectEventSpy);
            ds.trigger('respond', { query: 'foo', results: [model] });

            selectEventSpy.should.have.not.been.called;

            resultview.$('li').first().trigger('click');

            selectEventSpy.should.have.been.calledOnce;
            selectEventSpy.should.have.been.calledWith(model);
        });
    });

    describe('ResultsList', function () {
        var ds,
            resultview,
            model;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            ds = _.extend({}, Backbone.Events);
            model = new Backbone.Model();
            resultview = new AJS.ResultsList({ source: ds });

            $('#test-fixture').append(resultview.$el);
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        it('can be hidden programmatically', function () {
            expect(resultview.$el.is(':visible')).to.be.true;

            resultview.hide();
            expect(resultview.$el.is(':visible')).to.be.false;
        });

        it('can be shown programmatically', function () {
            resultview.hide();
            resultview.show();
            expect(resultview.$el.is(':visible')).to.be.true;
        });

        it('is not visible if the query has not changed since it was hidden', function () {
            var response = { query: 'foo', results: new Backbone.Model() };
            ds.trigger('respond', response);
            resultview.hide();
            ds.trigger('respond', response);
            expect(resultview.$el.is(':visible')).to.be.false;
        });

        it('is visible if the query has changed since it was last hidden', function () {
            ds.trigger('respond', { query: 'foo', results: new Backbone.Model() });
            resultview.hide();
            ds.trigger('respond', { query: 'bar', results: new Backbone.Model() });
            expect(resultview.$el.is(':visible')).to.be.true;
        });
    });

    describe('ResultsList#render', function () {
        var ds,
            resultview;
        beforeEach(function () {
            ds = new ProgressiveDataSet();
            resultview = new AJS.ResultsList({ source: ds });
            resultview.render = sinon.spy(resultview, 'render');
        });

        afterEach(function () {
            resultview.render.restore();
        });

        it('is called when #show is called', function () {
            resultview.show();

            resultview.render.should.have.been.calledOnce;
        });

        it('is called when the source is queried', function () {
            ds.query('foo');

            resultview.render.should.have.been.calledOnce;
        });

        it('is called even with an empty query for the source', function () {
            ds.query('');

            resultview.render.should.have.been.calledOnce;
        });

        it('is not called if the query has not changed since it was hidden', function () {
            var response = { query: 'foo', results: new Backbone.Model() };
            ds.trigger('respond', response);
            resultview.hide();
            ds.trigger('respond', response);
            resultview.render.should.have.been.calledOnce;
        });

        it('is called if the query changes since it was last hidden', function () {
            ds.trigger('respond', { query: 'foo', results: new Backbone.Model() });
            resultview.hide();
            ds.trigger('respond', { query: 'bar', results: new Backbone.Model() });
            resultview.render.should.have.been.calledTwice;
        });
    });

    describe('ResultsList#render - callback', function () {
        var realRender,
            ds;
        beforeEach(function () {
            realRender = sinon.stub(AJS.ResultsList.prototype, 'render');
            ds = new ProgressiveDataSet();
        });

        afterEach(function () {
            realRender.restore();
        });

        it('fires events before and after it is called', function () {
            var view = new AJS.ResultsList({ source: ds });
            var before = sinon.spy();
            var after = sinon.spy();

            view.render = sinon.spy(view, 'render');
            view.on('rendering', before);
            view.on('rendered', after);
            view.render();

            before.should.have.been.called;
            before.should.have.been.calledAfter(view.render);
            before.should.have.been.calledBefore(realRender);

            after.should.have.been.called;
            after.should.have.been.calledAfter(view.render);
            after.should.have.been.calledAfter(realRender);
        });

        it('fires events even if ResultsList is extended', function () {
            var realRender = sinon.stub();
            var AnotherList = AJS.ResultsList.extend({ render: realRender });
            var view = new AnotherList({ source: ds });
            var before = sinon.spy();
            var after = sinon.spy();

            view.render = sinon.spy(view, 'render');
            view.on('rendering', before);
            view.on('rendered', after);
            view.render();

            before.should.have.been.called;
            before.should.have.been.calledAfter(view.render);
            before.should.have.been.calledBefore(realRender);

            after.should.have.been.called;
            after.should.have.been.calledAfter(view.render);
            after.should.have.been.calledAfter(realRender);
        });
    });
});