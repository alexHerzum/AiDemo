/* jshint expr:true */
define(['messages', 'aui-mocha'], function () {
    'use strict';
    describe('Messages Unit Tests -', function () {
        var messagebar,
            clock,
            closeableMessage;

        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            AJS.$('#test-fixture').html('<div id="aui-message-bar"></div>');
            messagebar = AJS.$('#aui-message-bar');
            clock = sinon.useFakeTimers();
            closeableMessage = createMessageWithID('close-message-test');
        });

        afterEach(function () {
            clock.restore();
            AJS.$('.aui-message').remove();
            $('#test-fixture').remove();
        });

        function pressSpace () {
            AJS.mocha.pressKey(AJS.keyCode.SPACE);
        }

        function pressEnter () {
            AJS.mocha.pressKey(AJS.keyCode.ENTER);
        }

        function createMessageWithID (testid) {
            createMessageWithIDAndSetCloseable(testid, true);
        }

        function createMessageWithIDAndSetCloseable (testid, closeable) {
            AJS.messages.info({
                id: testid,
                title: 'Title',
                body: 'This message was created by messagesSetup() with id ' + testid,
                closeable: closeable
            });
        }

        function checkNoID (target) {
            return {
                found: target.find('.aui-message')[0].getAttribute('id'),
                expected: null
            };
        }

        it('Messages API', function () {
            expect(AJS.messages).to.be.an('object');
            expect(AJS.messages.setup).to.be.a('function');
            expect(AJS.messages.makeCloseable).to.be.a('function');
            expect(AJS.messages.template).to.be.a('string');
            expect(AJS.messages.createMessage).to.be.a('function');
        });

        it('Messages ID test: bad ID', function () {
            AJS.$('.aui-message').remove();
            createMessageWithID('#t.e.st-m### e s s a \'\'\'\"\"g e-id-full-of-dodgy-crap');
            var checkedNoID = checkNoID(messagebar);
            expect(checkedNoID.found).to.equal(checkedNoID.expected);
        });

        it('Messages ID test: no ID', function () {
            AJS.$('.aui-message').remove();
            createMessageWithID();
            var checkedNoID = checkNoID(messagebar);
            expect(checkedNoID.found).to.equal(checkedNoID.expected);
        });

        it('Messages ID test: good ID', function () {
            expect(AJS.$('#close-message-test').length).to.equal(1);
        });

        it('Closeable messages get a close button', function () {
            expect(AJS.$('#close-message-test').find('.icon-close').length).to.equal(1);
        });

        it('Closing a message triggers the document aui-close-message event', function () {
            expect(AJS.$('#close-message-test').length).to.equal(1);

            var closeMessageHandler = sinon.spy();
            $(document).on('aui-message-close', closeMessageHandler);

            AJS.$('#close-message-test .icon-close').click();
            clock.tick(100);

            expect(AJS.$('#close-message-test').length).to.equal(0);
            closeMessageHandler.should.have.been.calledOnce;
        });

        it('Calling makeCloseable on a closeable message will not generate multiple close buttons', function () {
            AJS.messages.makeCloseable('#close-message-test');

            expect(AJS.$('#close-message-test').find('.icon-close').length).to.equal(1);
        });

        it('Pressing SPACE when focused on icon-close will close a message box', function () {
            expect(AJS.$('#close-message-test').length).to.equal(1);

            var closeMessageHandler = sinon.spy();
            $(document).on('aui-message-close', closeMessageHandler);

            AJS.$('#close-message-test .icon-close')[0].focus();
            pressSpace();
            clock.tick(100);

            expect(AJS.$('#close-message-test').length).to.equal(0);
            closeMessageHandler.should.have.been.calledOnce;
        });

        it('Pressing ENTER when focused on icon-close will close a message box', function () {
            expect(AJS.$('#close-message-test').length).to.equal(1);

            var closeMessageHandler = sinon.spy();
            $(document).on('aui-message-close', closeMessageHandler);

            AJS.$('#close-message-test .icon-close')[0].focus();
            pressEnter();
            clock.tick(100);

            expect(AJS.$('#close-message-test').length).to.equal(0);
            closeMessageHandler.should.have.been.calledOnce;
        });

        it('Pressing SPACE when NOT focused on icon-close will not close message', function () {
            var testLink = $('<a href="http://www.google.com/" id="test-link">Click Me</a>');
            AJS.$('#close-message-test .title').append(testLink);
            expect(AJS.$('#close-message-test').length).to.equal(1);

            var closeMessageHandler = sinon.spy();
            $(document).on('aui-message-close', closeMessageHandler);

            testLink.focus();
            pressSpace();
            clock.tick(100);

            expect(AJS.$('#close-message-test').length).to.equal(1);
            closeMessageHandler.should.have.not.been.calledOnce;
        });

        it('Calling makeCloseable() on a non-closeable message will convert it to a closeable message', function () {
            AJS.$('.aui-message').remove();
            createMessageWithIDAndSetCloseable('close-message-test', false);
            expect(AJS.$('#close-message-test').length).to.equal(1);
            expect(AJS.$('#close-message-test.closeable').length, 0, 'No closeable message present');
            AJS.messages.makeCloseable('#close-message-test');
            expect(AJS.$('.closeable').length, 1, 'Message is now closeable');

            var closeMessageHandler = sinon.spy();
            $(document).on('aui-message-close', closeMessageHandler);

            AJS.$('#close-message-test .icon-close').click();
            clock.tick(100);

            expect(AJS.$('#close-message-test').length).to.equal(0);
            closeMessageHandler.should.have.been.calledOnce;
        });
    });
});