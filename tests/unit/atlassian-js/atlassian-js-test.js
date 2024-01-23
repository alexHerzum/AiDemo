/*jshint expr:true */
define(['aui'], function() {
    'use strict';
    describe('AJS Unit Tests -', function() {
        describe('Core functions -', function() {
            it('AJS version test', function() {
                expect('AJS.version').to.be.a('string');
            });

            it('alphanum', function() {
                function assertAlphaNum(a, b, expected) {
                    var actual = AJS.alphanum(a, b);
                    expect(actual).to.equal(expected);

                    // try in reverse
                    actual = AJS.alphanum(b, a);
                    expect(actual).to.equal(expected * -1);
                }

                assertAlphaNum('a', 'a', 0);
                assertAlphaNum('a', 'b', -1);
                assertAlphaNum('b', 'a', 1);

                assertAlphaNum('a0', 'a1', -1);
                assertAlphaNum('a10', 'a1', 1);
                assertAlphaNum('a2', 'a1', 1);
                assertAlphaNum('a2', 'a10', -1);
            });

            it('escape HTML', function() {
                expect(AJS.escapeHtml('a \" doublequote')).to.equal('a &quot; doublequote');
                expect(AJS.escapeHtml('a \' singlequote')).to.equal('a &#39; singlequote');
                expect(AJS.escapeHtml('a < lessthan')).to.equal('a &lt; lessthan');
                expect(AJS.escapeHtml('a > greaterthan')).to.equal('a &gt; greaterthan');
                expect(AJS.escapeHtml('a & ampersand')).to.equal('a &amp; ampersand');
                expect(AJS.escapeHtml('a ` accent grave')).to.equal('a &#96; accent grave');
                expect(AJS.escapeHtml('foo')).to.equal('foo');
                expect(AJS.escapeHtml('<foo>')).to.equal('&lt;foo&gt;');
                expect(AJS.escapeHtml('as<foo>as')).to.equal('as&lt;foo&gt;as');
                expect(AJS.escapeHtml('some <input class=\"foo\" value=\'bar&wombat\'> thing')).to.equal('some &lt;input class=&quot;foo&quot; value=&#39;bar&amp;wombat&#39;&gt; thing');
            });

            it('filter by search', function() {
                var entries = [
                    {
                        'name': 'potato',
                        'keywords': ['potato', 'mashed', 'chip', 'baked']
                    },
                    {
                        'name': 'chocolate',
                        'keywords': ['chocolate', 'biscuits', 'bar', 'chip']
                    },
                    {
                        'name': 'venues',
                        'keywords': ['venues', 'pub', 'bar', 'club']
                    }
                ];

                // Searching for x should return item with names y
                function assertResult(search, itemNames) {
                    var result = AJS.filterBySearch(entries, search);
                    var resultNames = [];

                    result.forEach(function(entry) {
                        resultNames.push(entry.name);
                    });

                    expect(resultNames).to.deep.equal(itemNames);
                }

                assertResult('', []);
                assertResult('potato', ['potato']);
                assertResult('bar', ['chocolate', 'venues']);
                assertResult('chip', ['potato', 'chocolate']);
                assertResult('chip bar', ['chocolate']);
            });
        });

        describe('Populate parameter', function() {
            beforeEach(function() {
                $('<div id="test-fixture"></div>').appendTo(document.body);
            });

            afterEach(function() {
                AJS.params = {};
                $('#test-fixture').remove();
            });

            it('with list input', function () {
                AJS.$('<fieldset class="parameters"><input title="test1" class="list" value="value1"><input title="test1" class="list" value="value2"></fieldset>').appendTo('#test-fixture');
                AJS.populateParameters();

                expect(AJS.params.test1.length).to.equal(2);
                expect(AJS.params.test1[0]).to.equal('value1');
                expect(AJS.params.test1[1]).to.equal('value2');
            });

            it('with no parameter', function() {
                AJS.$('<fieldset class="parameters"><input id="test1" value="value1"></fieldset>').appendTo('#test-fixture');
                AJS.populateParameters();
                expect(AJS.params.test1).to.equal('value1');
            });

            it('with parameter', function() {
                AJS.$('<fieldset class="parameters"><input id="test1" value="value1"></fieldset>').appendTo('#test-fixture');
                var toPopulate = {};
                AJS.populateParameters(toPopulate);
                expect(toPopulate.test1).to.equal('value1');
                expect(AJS.params.test1).to.equal(undefined);
            });
        });

        describe('Clipping', function() {
            beforeEach(function() {
                $('<div id="test-fixture"></div>').appendTo(document.body);
                AJS.$('#test-fixture').html(
                        '<p id="shouldBeClipped">Long Long Long Long Long Long Long Long Long Long Long Long Long Long Long</p>' +
                        '<p id="shouldNotBeClipped">Short</p>'
                );
            });

            afterEach(function() {
                $('#test-fixture').remove();
            });

            it('long paragraph', function() {
                expect(AJS.isClipped(AJS.$('#shouldBeClipped'))).to.be.true;
            });

            it('short paragraph', function() {
                expect(AJS.isClipped(AJS.$('#shouldNotBeClipped'))).to.be.false;
            });
        });

        describe('Initialisation', function() {
            it('on multiple functions', function() {
                var func1 = sinon.spy();
                var func2 = sinon.spy();

                AJS.toInit(func1);
                AJS.toInit(func2);

                func1.should.have.been.calledOnce;
                func2.should.have.been.calledOnce;
            });

            it('should properly throw errors from passed in functions', function() {
                var func1 = sinon.stub().throws('WTF');
                var func2 = sinon.spy();

                AJS.toInit(func1);
                AJS.toInit(func2);

                func1.should.have.thrown('WTF');
                func2.should.have.been.calledOnce;
            });
        });

        describe('Generate', function () {
            beforeEach(function() {
                $('<div id="test-fixture"></div>').appendTo(document.body);
            });

            afterEach(function() {
                AJS.uniqueIDcounter = 0;
                $('#test-fixture').remove();
            });

            it('default ID', function() {
                expect(AJS.id()).to.equal('aui-uid-0');
            });

            it('ID using a given prefix', function() {
                expect(AJS.id('foo')).to.equal('foo1');
            });

            it('default ID and add to element', function() {
                var $el = AJS.$('<div></div>').appendTo('#test-fixture');
                AJS._addID($el);
                expect($el.attr('id')).to.equal('aui-uid-2');
            });

            it('prefixed ID and add to element', function() {
                var $el = AJS.$('<div></div>').appendTo('#test-fixture');
                AJS._addID($el, 'foo');
                expect($el.attr('id')).to.equal('foo3');
            });

            it('multiple IDs and add them to elements', function() {
                AJS.$('<div class="idmultiple"></div><div class="idmultiple"></div><div class="idmultiple"></div>').appendTo('#test-fixture');
                AJS._addID(AJS.$('.idmultiple'));
                expect(AJS.$('.idmultiple:eq(0)').attr('id')).to.equal('aui-uid-4');
                expect(AJS.$('.idmultiple:eq(1)').attr('id')).to.equal('aui-uid-5');
                expect(AJS.$('.idmultiple:eq(2)').attr('id')).to.equal('aui-uid-6');
            });

            it('ID must return a string', function() {
                expect(AJS.id()).to.be.a('string');
            });
        });

        describe('Prevent default', function() {
            it('on click event and confirm event is prevented', function() {
                var e = AJS.$.Event('click');
                AJS.preventDefault(e);
                expect(e.isDefaultPrevented()).to.be.true;
            });
        });

        describe('Index of', function() {
            it('an arbitrary array', function () {
                var arr = ['foo', 'bar', 'baz'];
                expect(AJS.indexOf(arr, 'foo')).to.equal(0);
                expect(AJS.indexOf(arr, 'baz')).to.equal(2);
                expect(AJS.indexOf(arr, 'blops')).to.equal(-1);
            });

            it('given a starting index', function () {
                var arr = ['foo', 'bar', 'baz'];
                expect(AJS.indexOf(arr, 'foo', 1)).to.equal(-1);
                expect(AJS.indexOf(arr, 'baz', 1)).to.equal(2);
                expect(AJS.indexOf(arr, 'blops', 1)).to.equal(-1);
            });

            it('given a negative starting index', function () {
                var arr = ['foo', 'bar', 'baz'];
                expect(AJS.indexOf(arr, 'foo', -1)).to.equal(-1);
                expect(AJS.indexOf(arr, 'baz', -1)).to.equal(2);
                expect(AJS.indexOf(arr, 'blops', -1)).to.equal(-1);
            });
        });
    });
});