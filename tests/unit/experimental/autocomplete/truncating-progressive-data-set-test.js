/* jshint expr: true */
define([
    'backbone',
    'experimental-autocomplete/truncating-progressive-data-set',
    'aui-mocha'
], function (
    Backbone,
    TruncatingProgressiveDataSet
) {
    'use strict';
    describe('Truncating progressive data set tests -', function () {
        var testSearch = function(item, term) {
            return item.get('username') && item.get('username').indexOf(term) > -1;
        };

        describe('querying with remote sources that return truncated results', function () {
            var url,
                data,
                server;
            beforeEach(function () {
                var UserModel = Backbone.Model.extend({
                    idAttribute: 'username'
                });
                url = '/dummy/search';
                data = new TruncatingProgressiveDataSet([], {
                    model: UserModel,
                    matcher: testSearch,
                    maxResponseSize: 4,
                    queryEndpoint: url,
                    queryParamKey: 'username'
                });
                server = sinon.fakeServer.create();
            });

            afterEach(function () {
                server.restore();
            });

            it('does re-request data when response is potentially truncated', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                server.respondWith('GET', url + '?username=atl', [200, { 'Content-Type': 'application/json' }, '[{"username":"atl"},{"username":"atl2"},{"username":"atlas"},{"username":"atlas2"}]']);
                server.respondWith('GET', url + '?username=atlas', [200, { 'Content-Type': 'application/json' }, '[{"username":"atlas"},{"username":"atlas2"},{"username":"atlassian"}]']);

                data.query('atl');
                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledOnce;
                server.respond();
                callback.should.have.been.calledTwice;

                data.query('atlas');
                callback.should.have.been.calledThrice;
                expect(server.requests.length).to.equal(2);
                server.respond();

                callback.should.have.callCount(4);
                expect(callback.getCall(1).args[0].results[0].get('username')).to.equal('atl');
                expect(callback.getCall(1).args[0].results[1].get('username')).to.equal('atl2');
                expect(callback.getCall(1).args[0].results[2].get('username')).to.equal('atlas');
                expect(callback.getCall(3).args[0].results[0].get('username')).to.equal('atlas');
                expect(callback.getCall(3).args[0].results[1].get('username')).to.equal('atlas2');
                expect(callback.getCall(3).args[0].results[2].get('username')).to.equal('atlassian');
            });

            it('does not re-request data when response is not truncated', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                server.respondWith('GET', url + '?username=atl', [200, { 'Content-Type': 'application/json' }, '[{"username":"atl"},{"username":"atl2"},{"username":"atlas"}]']);

                data.query('atl');
                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledOnce;
                server.respond();
                callback.should.have.been.calledTwice;

                data.query('atlas');
                callback.should.have.been.calledThrice;

                expect(callback.getCall(1).args[0].results[0].get('username')).to.equal('atl');
                expect(callback.getCall(1).args[0].results[1].get('username')).to.equal('atl2');
                expect(callback.getCall(1).args[0].results[2].get('username')).to.equal('atlas');
                expect(callback.getCall(2).args[0].results[0].get('username')).to.equal('atlas');
            });

            it('ignores response size when query is completely different', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                server.respondWith('GET', url + '?username=a', [200, { 'Content-Type': 'application/json' }, '[{"username":"atl"},{"username":"atl2"},{"username":"atlas"},{"username":"atlas2"}]']);
                server.respondWith('GET', url + '?username=b', [200, { 'Content-Type': 'application/json' }, '[{"username":"brian"}]']);

                data.query('a');
                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledOnce;
                server.respond();
                callback.should.have.been.calledTwice;

                data.query('b');
                callback.should.have.been.calledThrice;
                expect(server.requests.length).to.equal(2);
                server.respond();

                callback.should.have.callCount(4);
                expect(callback.getCall(1).args[0].results[0].get('username')).to.equal('atl');
                expect(callback.getCall(1).args[0].results[1].get('username')).to.equal('atl2');
                expect(callback.getCall(1).args[0].results[2].get('username')).to.equal('atlas');
                expect(callback.getCall(3).args[0].results[0].get('username')).to.equal('brian');
            });

            it('does not re-request if original request returned nothing', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                server.respondWith('GET', url + '?username=a', [200, { 'Content-Type': 'application/json' }, '[]']);

                data.query('a');
                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledOnce;
                server.respond();
                callback.should.have.been.calledTwice;

                data.query('ab');
                callback.should.have.been.calledThrice;
                expect(server.requests.length).to.equal(1);

                expect(callback.getCall(1).args[0].results.length).to.equal(0);
                expect(callback.getCall(2).args[0].results.length).to.equal(0);
            });
        });
    });
});