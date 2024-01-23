/* jshint expr:true */
define([
    'underscore',
    'backbone',
    'experimental-autocomplete/query-result',
    'aui-mocha'
], function (
    _,
    Backbone
) {
    'use strict';
    describe('Query result tests -', function () {
        var source,
            resultset;
        beforeEach(function () {
            source = _.extend({}, Backbone.Events);
            resultset = new AJS.ResultSet({ source: source });
        });

        function modelsEqual(actual, expected) {
            expect(actual.attributes).to.deep.equal(expected.attributes);
        }

        describe('active element', function () {
            it('is null when has no data', function () {
                var active = resultset.get('active');
                expect(active).to.deep.equal(null);
            });

            it('is the first model in the set when processed', function () {
                var models = [new Backbone.Model(), new Backbone.Model()];
                source.trigger('respond', { results: models });

                var active = resultset.get('active');
                expect(active).to.deep.equal(models[0]);
            });

            it('can be set by passing a model id', function () {
                var models = [ new Backbone.Model({id:'foo'}), new Backbone.Model({id:'bar'}), new Backbone.Model({id:'baz'}) ];
                source.trigger('respond', { results: models });

                var active = resultset.setActive('bar');
                expect(active).to.deep.equal(models[1]);
            });

            it('is set to null if set doesn\'t contain the model id ', function () {
                var models = [ new Backbone.Model({id:'foo'}), new Backbone.Model({id:'bar'}), new Backbone.Model({id:'baz'}) ];
                source.trigger('respond', { results: models });

                var active = resultset.setActive('nonexistant');
                expect(active).to.deep.equal(null);
            });
        });

        describe('collection', function () {
            it('can iterate over the models in the set', function () {
                var models = [new Backbone.Model(), new Backbone.Model()];
                source.trigger('respond', { results: models });

                resultset.each(function(model, index) {
                    expect(model).to.equal(models[index]);
                });
            });
        });

        describe('empty set', function () {
            it('#next and #prev set active to null', function () {
                resultset.next();
                expect(resultset.get('active')).to.deep.equal(null);

                resultset.prev();
                expect(resultset.get('active')).to.deep.equal(null);
            });
        });

        describe('one element', function () {
            var models;
            beforeEach(function () {
                models = [ new Backbone.Model({id:'foo'}) ];
                resultset.process({ query: 'foo', results: models });
            });

            it('#next and #prev don\'t affect active', function () {
                resultset.next();
                expect(resultset.get('active')).to.deep.equal(models[0]);

                resultset.prev();
                expect(resultset.get('active')).to.deep.equal(models[0]);
            });
        });

        describe('two elements with first selected', function () {
            var models;
            beforeEach(function () {
                models = [ new Backbone.Model({id:'foo'}), new Backbone.Model({id:'fez'}) ];
                resultset.process({ query: 'f', results: models });
            });

            it('will select the other element when #next is called', function () {
                resultset.next();
                expect(resultset.get('active')).to.deep.equal(models[1]);
            });

            it('will select the other element when #prev is called', function () {
                resultset.prev();
                expect(resultset.get('active')).to.deep.equal(models[1]);
            });
        });

        describe('three elements with middle selected', function () {
            var models;
            beforeEach(function () {
                models = [ new Backbone.Model({id:'a1'}), new Backbone.Model({id:'a2'}), new Backbone.Model({id:'a3'}) ];
                resultset.process({ query: 'a', results: models });
                resultset.setActive('a2');
            });

            it('will select the third element when #next is called once', function () {
                resultset.next();
                modelsEqual(resultset.get('active'), models[2]);
            });

            it('will select the first element when #next is called twice', function () {
                resultset.next();
                resultset.next();
                modelsEqual(resultset.get('active'), models[0]);
            });

            it('will select the second element when #next is called thrice', function () {
                resultset.next();
                resultset.next();
                resultset.next();
                modelsEqual(resultset.get('active'), models[1]);
            });

            it('will select the first element when #prev is called once', function () {
                resultset.prev();
                modelsEqual(resultset.get('active'), models[0]);
            });

            it('will select the third element when #prev is called twice', function () {
                resultset.prev();
                resultset.prev();
                modelsEqual(resultset.get('active'), models[2]);
            });

            it('will select the second element when #prev is called thrice', function () {
                resultset.prev();
                resultset.prev();
                resultset.prev();
                modelsEqual(resultset.get('active'), models[1]);
            });
        });
    });
});