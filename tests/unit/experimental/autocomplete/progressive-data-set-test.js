/* jshint expr:true */
define([
    'experimental-autocomplete/progressive-data-set',
    'underscore',
    'backbone',
    'aui-mocha'
], function (
    ProgressiveDataSet,
    _,
    Backbone
) {
    'use strict';
    describe('Autocomplete', function () {
        var testSearch = function (item, term) {
            return item.get('username') && item.get('username').indexOf(term) > -1;
        };

        describe('querying with local data -', function () {
            var data;
            beforeEach(function () {
                data = new ProgressiveDataSet([
                    {name: 'Chris', username: 'cdarroch'},
                    {name: 'Jason', username: 'jberry'},
                    {name: 'Adam', username: 'aahmed'}
                ]);
                data.matcher = testSearch;
            });

            it('empty query yields empty response', function () {
                var callback = sinon.spy(), response;
                data.matcher = function () { return true; };
                data.bind('respond', callback);
                data.query('');
                response = callback.getCall(0).args[0];
                expect(response).to.be.a('object');
                expect(response.query).to.equal('');
                expect(response.results.length).to.equal(0);
            });

            it('can query the data it contains', function () {
                var callback = sinon.spy(), response;
                data.bind('respond', callback);
                data.query('c');
                response = callback.getCall(0).args[0];
                expect(response.results.length).to.equal(1);
                expect(response.results[0].get('name')).to.equal('Chris');
            });

            it('queries result in an immediate response', function () {
                var callback = sinon.spy();
                var data = new ProgressiveDataSet([], {
                    queryEndpoint: false
                });
                data.bind('respond', callback);
                callback.should.have.not.been.called;
                data.query('');
                callback.should.have.been.calledOnce;
            });

            it('can use #query as a callback handler', function () {
                var callback = sinon.spy();
                var trigger = function(fn) { fn.call(this, 'c'); };
                data.bind('respond', callback);
                trigger(data.query);

                callback.should.have.been.calledOnce;
                expect(callback.getCall(0).args[0].results.length).to.equal(1);
            });
        });

        describe('configuring remote sources -', function () {
            var xhr;
            var requests = [];
            beforeEach(function () {
                requests = [];
                xhr = sinon.useFakeXMLHttpRequest();
                xhr.onCreate = function(xhr) {
                    requests.push(xhr);
                };
            });

            afterEach(function () {
                xhr.restore();
            });

            it('can provide the name of the query parameter key', function () {
                var data = new ProgressiveDataSet([], {
                    queryEndpoint: '/foo',
                    queryParamKey: 'bar'
                });
                data.query('myQuery');

                expect(requests[0].url).to.equal('/foo?bar=myQuery');
            });

            it('can provide additional query parameters to send with each query', function () {
                var data = new ProgressiveDataSet([], {
                    queryEndpoint: '/foo',
                    queryParamKey: 'bar',
                    queryData: {
                        'maxResults': 10,
                        'long': 'john'
                    }
                });
                data.query('myQuery');
                var url = requests[0].url;

                expect(url).to.match(/bar=myQuery/);
                expect(url).to.match(/maxResults=10/);
                expect(url).to.match(/long=john/);
            });

            it('query data can be a function', function () {
                var params = { 'long': 'john' };
                var queryData = function () { return params; };
                var data = new ProgressiveDataSet([], {
                    queryEndpoint: '/foo',
                    queryParamKey: 'bar',
                    queryData: queryData
                });
                var url;

                data.query('myQuery');
                url = requests[0].url;

                expect(url).to.match(/long=john/);

                params.maxResults = 10;
                data.query('myQuery');
                url = requests[1].url;

                expect(url).to.match(/maxResults=10/);
            });

            it('the named query parameter always trumps any additional query data provided', function () {
                var data = new ProgressiveDataSet([], {
                    queryEndpoint: '/foo',
                    queryParamKey: 'bar',
                    queryData: {
                        'bar': 'wrong'
                    }
                });
                data.query('myQuery');
                var url = requests[0].url;

                expect(url).to.match(/bar=myQuery/);
                expect(url).to.not.match(/bar=wrong/);
            });
        });

        describe('querying with remote sources -', function () {
            var server,
                url,
                data;
            beforeEach(function () {
                url = '/dummy/search';
                data = new ProgressiveDataSet([], {
                    matcher: testSearch,
                    maxResults: 5,
                    queryEndpoint: url,
                    queryParamKey: 'username'
                });
                server = sinon.fakeServer.create();
                server.respondWith('GET', url + '?username=a', [200, { 'Content-Type': 'application/json' }, '[{"username":"adam"},{"username":"admin"},{"username":"anna"}]']);
                server.respondWith('GET', url + '?username=c', [200, { 'Content-Type': 'application/json' }, '[{"username":"chris"}]']);
                server.respondWith('GET', url + '?username=j', [200, { 'Content-Type': 'application/json' }, '[{"username":"jason"}]']);
            });

            afterEach(function () {
                server.restore();
            });

            it('queries result in an immediate (though perhaps incomplete) response, even when there is a remote source', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                callback.should.not.have.been.called;
                data.query('c');
                callback.should.have.been.calledOnce;
                var resp = callback.args[0][0];
                expect(_.isArray(resp.results)).to.be.true;
                expect(_.isEmpty(resp.results)).to.be.true;
            });

            it('queries receive a second response if the first is insufficient', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                data.query('c');
                callback.should.have.been.calledOnce;

                server.respond();
                callback.should.have.been.calledTwice;

                var resp = callback.getCall(1).args[0];
                expect(resp.results.length).to.equal(1);
                expect(resp.results[0].get('username')).to.equal('chris');
            });

            it('server is not hit if there is no query', function () {
                data.query('');
                expect(server.requests.length).to.equal(0);
            });

            it('results from server are added to existing stored entries', function () {
                data.add({username:'bob'});
                data.query('a');
                server.respond();
                expect(data.length).to.equal(4);
            });

            it('response always uses most recent query', function () {
                var callback = sinon.spy();

                // Make two queries that will result in ajax requests
                data.query('c');
                // TODO: some time passes...
                data.query('j');

                // bind to respond now, once the synchronous responses have already been made.
                data.bind('respond', callback);
                server.processRequest(server.requests[1]); // respond with the results for 'j' first,
                server.processRequest(server.requests[0]); // then 'c'.
                callback.should.have.been.calledTwice;

                // assert results for the first response (on 'j')
                var resp = callback.getCall(0).args[0];
                expect(resp.query).to.equal('j');
                expect(resp.results.length).to.equal(1);
                expect(resp.results[0].get('username')).to.equal('jason');
                // assert the results were consistent between the 'j' and 'c' response
                expect(callback.getCall(1).args).to.deep.equal(callback.getCall(0).args);
            });

            it('does not re-request data when sufficient information available', function () {
                var callback = sinon.spy();
                var response = [200, {'Content-type': 'application/json'}, '[{"username":"adam"},{"username":"admin"}]'];
                server.respondWith('GET', url + '?username=ad', response);
                server.respondWith('GET', url + '?username=adm', response);
                data.setMaxResults(2);
                data.bind('respond', callback);
                data.query('adm');
                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledOnce;

                server.respond();
                data.query('ad');

                expect(server.requests.length).to.equal(1);
                callback.should.have.been.calledThrice;
                expect(callback.getCall(1).args[0].results[0].get('username')).to.equal('admin');
                expect(callback.getCall(2).args[0].results[0].get('username')).to.equal('adam');
                expect(callback.getCall(2).args[0].results[1].get('username')).to.equal('admin');
            });

            it('requests are not re-made once they are returned', function () {
                data.query('a');
                data.query('c');
                server.respond();
                data.query('a');
                data.query('c');

                expect(server.requests.length).to.equal(2);
            });
        });

        describe('remote activity -', function () {
            var requests = [],
                xhr,
                data,
                activity;
            beforeEach(function () {
                requests = [];
                xhr = sinon.useFakeXMLHttpRequest();
                xhr.onCreate = function(xhr) {
                    requests.push(xhr);
                };

                data = new ProgressiveDataSet([], {
                    matcher: testSearch,
                    queryEndpoint: '/dummy/search'
                });
                activity = sinon.spy();
                data.bind('activity', activity);
            });

            afterEach(function () {
                xhr.restore();
            });

            it('fires an "activity" event when a server request is made', function () {
                data.query('a');

                activity.should.have.been.calledOnce;
            });

            it('"activity" is true if there is an active server request', function () {
                data.query('a');

                expect(activity.getCall(0).args[0]).to.deep.equal({activity: true});
            });

            it('fires an "activity" event when server responds', function () {
                data.query('a');
                requests[0].respond();

                activity.should.have.been.calledTwice;
            });

            it('"activity" is false when no active queries', function () {
                data.query('a');
                requests[0].respond();

                expect(activity.getCall(1).args[0]).to.deep.equal({activity: false});
            });

            it('"activity" is true when there is at least one active request', function () {
                data.query('arthos');
                data.query('porthos');
                requests[0].respond();

                activity.should.have.been.calledThrice;
                expect(activity.getCall(2).args[0]).to.deep.equal({activity: true});
            });

            it('"activity" will not fire when a query was cached', function () {
                data.query('arthos');
                requests[0].respond();
                data.query('arthos');

                activity.should.have.been.calledTwice;
            });
        });

        describe('result sets', function () {
            function dataSourceWithId(id) {
                var model = Backbone.Model.extend({ idAttribute: id });
                return new ProgressiveDataSet(null, { model: model });
            }

            it('will happily duplicate data without a unique identifier', function () {
                var data = dataSourceWithId(false);
                data.add([{value:'abacus'},{value:'calculator'}]);
                data.add({value:'abacus'});
                expect(data.length).to.equal(3);
            });

            it('can be given a uniqueness constraint', function () {
                var data = dataSourceWithId('value');
                data.add([{value:'abacus'},{value:'calculator'}]);
                data.add({value:'abacus'});
                expect(data.length).to.equal(2);
            });
        });

        describe('result limits', function () {
            var data;
            beforeEach(function () {
                data = new ProgressiveDataSet();
                data.matcher = function () { return true; };
                for(var i=0,ii=20;i<ii;i++) {
                    data.add({username:'chris'+i});
                }
            });

            it('number of items in response can be limited', function () {
                var callback = sinon.spy();
                data.setMaxResults(5);
                data.bind('respond', callback);
                data.query('c');
                expect(callback.getCall(0).args[0].results.length).to.equal(5);
            });

            it('change causes response to be fired', function () {
                var callback = sinon.spy();
                data.bind('respond', callback);
                data.setMaxResults(5);
                data.query('c');
                data.setMaxResults(10);
                callback.should.have.been.calledTwice;
                expect(callback.getCall(0).args[0].results.length).to.equal(5);
                expect(callback.getCall(1).args[0].results.length).to.equal(10);
            });
        });
    });
});