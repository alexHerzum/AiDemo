/* jshint expr:true */
define(['aui-experimental-tooltip', 'tipsy', 'aui-mocha'], function () {
    'use strict';
    describe('Tooltips', function () {
        var $el,
            clock;
        var TIPSY_DELAY = 10;

        beforeEach(function () {
            clock = sinon.useFakeTimers();
            $el = $('<div title="my element">Element</div>');
            $(document.body).append($el);
            $el.tooltip({
                delayIn: TIPSY_DELAY
            });

        });
        afterEach(function () {
            clock.restore();
            $el.remove();
            $(document.body).find('.tipsy').remove();
        });

        function visibleTipsies () {
            return $(document.body).find('.tipsy').filter(':visible');
        }

        it('will show up when delayed', function () {
            expect(visibleTipsies().length).to.equal(0);

            AJS.mocha.hover($el);

            clock.tick(1);
            expect(visibleTipsies().length).to.equal(0);

            clock.tick(TIPSY_DELAY);
            var $tipsies = visibleTipsies();
            expect($tipsies.length).to.equal(1);

            var position = $tipsies.position();
            expect(position.left).to.not.equal(0);
            expect(position.top).to.not.equal(0);
        });

        it('will not show when they are delayed and if the underlying element is gone', function () {
            expect(visibleTipsies().length).to.equal(0);

            AJS.mocha.hover($el);

            $el.remove();

            clock.tick(TIPSY_DELAY);
            expect(visibleTipsies().length).to.equal(0);
            expect($('.tipsy').length).to.not.be.defined;
        });
    });
});