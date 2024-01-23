/* jshint expr:true */
define(['aui-mocha'], function() {
    'use strict';
    describe('Deprecation Util', function () {
        var fakeStack = [];
        fakeStack.push('Error');
        fakeStack.push('    at getDeprecatedLocation (http://localhost:9876/base/src/js/internal/deprecation.js:67:19)');
        fakeStack.push('    at http://localhost:9876/base/src/js/internal/deprecation.js:40:38');
        fakeStack.push('    at Object.<anonymous> (http://localhost:9876/base/src/js/internal/deprecation.js:91:13)');
        fakeStack.push('    at assertFunctionDeprecated (http://localhost:9876/base/tests/unit/deprecation-test.js:37:22)');
        fakeStack.push('    at Object.<anonymous> (http://localhost:9876/base/tests/unit/deprecation-test.js:70:9)');
        fakeStack.push('    at Object.Test.run (http://localhost:9876/base/node_modules/qunitjs/qunit/qunit.js:203:18)');
        fakeStack.push('    at http://localhost:9876/base/node_modules/qunitjs/qunit/qunit.js:361:10');
        fakeStack.push('    at process (http://localhost:9876/base/node_modules/qunitjs/qunit/qunit.js:1453:24)');
        fakeStack.push('    at http://localhost:9876/base/node_modules/qunitjs/qunit/qunit.js:479:5');

        function getFakeStackMessage () {
            return fakeStack[4];
        }

        var logger;
        beforeEach(function () {
            logger = sinon.stub(AJS.deprecate, '__logger');
            sinon.stub(AJS.deprecate, '__getDeprecatedLocation', getFakeStackMessage);
        });

        afterEach(function () {
            AJS.deprecate.__logger.restore();
            AJS.deprecate.__getDeprecatedLocation.restore();
        });

        function assertDeprecationMessageContainsInputs (message, display, alternate, since, remove, extraInfo) {
            if (!message) {
                ok(false, 'No message was logged.');
                return;
            }
            message = message.split('\n')[0];
            expect(~message.indexOf(display || 'DISPLAY')).to.be.defined;
            expect(~message.indexOf(alternate || 'ALTERNATE')).to.be.defined;
            expect(~message.indexOf(since || 'SINCE')).to.be.defined;
            expect(~message.indexOf(remove || 'REMOVE')).to.be.defined;
            expect(~message.indexOf(extraInfo || 'EXTRA')).to.be.defined;
        }

        function assertFunctionDeprecated (deprecatedFn, self, arg, display, alternate, since, remove, extraInfo) {
            logger.reset();
            deprecatedFn.call(self, arg);
            logger.should.have.been.calledOnce;
            assertDeprecationMessageContainsInputs(logger.args[0] && logger.args[0][0], display, alternate, since, remove, extraInfo);
            deprecatedFn.call(self, arg);
            logger.should.have.been.calledOnce;
        }

        function assertNoncallablePropertyDeprecated (obj, deprecatedProp, initialVal, display, alternate, since, remove, extraInfo) {
            logger.reset();
            var actualValue = obj[deprecatedProp];
            expect(actualValue).to.equal(initialVal);

            logger.should.have.been.calledOnce;
            assertDeprecationMessageContainsInputs(logger.args[0] && logger.args[0][0], display, alternate, since, remove, extraInfo);
            expect(obj[deprecatedProp] = 'a').to.equal('a');
            logger.should.have.been.calledOnce;
            expect(obj[deprecatedProp]).to.equal('a');
            obj[deprecatedProp] = actualValue;
        }

        it('deprecate.fn()', function () {
            //expect(12);

            var self = {};
            var arg = {};

            function fn(param) {
                expect(this).to.equal(self);
                expect(param).to.equal(arg);
            }
            var deprecatedFn = AJS.deprecate.fn(fn, 'DISPLAY', {alternativeName:'ALTERNATE', removeInVersion: 'REMOVE', sinceVersion:'SINCE', extraInfo:'EXTRA'});
            expect(deprecatedFn).to.be.a('function');

            assertFunctionDeprecated(deprecatedFn, self, arg);
        });

        it('deprecate.prop()', function () {
            //expect(21);
            var arg = {};

            var prop = {};
            var obj = {
                prop : prop,
                method : function(param) {
                    expect(this).to.equal(obj);
                    expect(param).to.equal(arg);
                }
            };

            AJS.deprecate.prop(obj, 'prop', {displayName:'DISPLAY', alternativeName:'ALTERNATE', removeInVersion: 'REMOVE', sinceVersion:'SINCE', extraInfo:'EXTRA'});
            assertNoncallablePropertyDeprecated(obj, 'prop', prop);

            AJS.deprecate.prop(obj, 'method', {displayName:'DISPLAY', alternativeName:'ALTERNATE', removeInVersion: 'REMOVE', sinceVersion:'SINCE', extraInfo:'EXTRA'});
            assertFunctionDeprecated(obj.method, obj, arg);
        });

        it('deprecate.obj()', function () {
            //expect(21);
            var arg = {};

            var prop = {};
            var method = function(param) {
                expect(this).to.equal(obj);
                expect(param).to.equal(arg);
            };
            var obj = {
                prop : prop,
                method : method
            };

            AJS.deprecate.obj(obj, 'OBJ:', {
                alternativeNamePrefix: 'ALTERNATIVE:',
                removeInVersion: 'REMOVE',
                sinceVersion: 'SINCE',
                extraInfo: 'EXTRA INFO'
            });

            assertNoncallablePropertyDeprecated(obj, 'prop', prop, 'OBJ:prop', 'ALTERNATIVE:prop', 'SINCE', 'REMOVE', 'EXTRA INFO');
            assertFunctionDeprecated(obj.method, obj, arg, 'OBJ:method', 'ALTERNATIVE:method', 'SINCE', 'REMOVE', 'EXTRA INFO');
        });

        describe('defaults', function () {
            var log,
                warn,
                console;
            beforeEach(function () {
                if (!console) {
                    console = {
                        log: function () {},
                        warn: function () {}
                    };
                }
                log = sinon.spy(console, 'log');
                warn = sinon.spy(console, 'warn');
            });

            afterEach(function () {
                console.warn.restore();
                console.log.restore();
            });

        // TODO AUI-2700 - use console.warn
        //    it('default logger is console.warn', function () {
        //        AJS.deprecate.__logger('test');
        //        log.should.have.been.calledOnce;
        //        warn.should.have.been.calledOnce;
        //        warn.should.have.been.calledWith('test');
        //    });
        });
    });
});