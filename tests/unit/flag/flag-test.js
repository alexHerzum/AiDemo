/* jshint expr:true */
define(['aui/flag', 'jquery', 'aui-mocha'], function (flag, $, browser) {
    'use strict';
    describe('Flag message tests -', function () {
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            $('#test-fixture').append('<div id="aui-flag-container"></div>');
        });

        afterEach(function () {
            $('#aui-flag-container').remove();
            $('#test-fixture').remove();
        });

        function setupInfoFlag () {
            var title = 'Title';
            var body = 'This message should float over the screen';
            flag({
                type: 'info',
                title: title,
                body: body,
                persistent: false
            });

            return {
                title: title,
                body: body
            };
        }

        function setupDefaultFlag () {
            flag({body: 'This is a message with nearly all options default'});
        }

        function getFlagText () {
            return $('.aui-flag');
        }

        it('Floating message is present on the screen', function () {
            setupInfoFlag();
            expect(getFlagText().length).to.equal(1);
        });

        it('Floating messages HTML contain the title and contents somewhere', function () {
            var flagProperties = setupInfoFlag();
            expect(getFlagText().html().indexOf(flagProperties.title)).to.not.equal(-1);
            expect(getFlagText().html().indexOf(flagProperties.body)).to.not.equal(-1);
        });

        it('Messages appear with mostly default options', function () {
            setupDefaultFlag();
            expect(getFlagText().length).to.equal(1);
        });
    });
});