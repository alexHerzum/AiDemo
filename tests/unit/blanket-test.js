/* jshint expr:true */
define(['blanket', 'aui-mocha'], function () {
    'use strict';
    describe('Blanket', function () {
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        function getBlanketZIndex () {
            return AJS.dim.$dim.css('z-index');
        }

        it('dim() will update the z-index accordingly', function () {
            AJS.dim(false, 5);
            expect(getBlanketZIndex()).to.equal('5');
            AJS.dim(false, 10);
            expect(getBlanketZIndex()).to.equal('10');
        });

        it('dim() will not created multiple blankets on duplicate calls', function () {
            AJS.dim();
            AJS.dim();
            expect(AJS.$('.aui-blanket').length).to.equal(1);
        });

        it('dim() and undim() will hide all blankets that were previously visible', function () {
            AJS.dim();
            AJS.undim();
            var noBlanket = !AJS.dim.$dim;
            var invisibleBlanket = AJS.dim.$dim.css('visibility') === 'hidden';
            expect(noBlanket || invisibleBlanket).to.be.true;
        });

        describe('overflow', function () {
            describe('on <body>', function() {
                it('is reverted to visible on undim if it was originally visible', function () {
                    AJS.$('body').css({'overflow': ''});
                    AJS.dim();
                    AJS.undim();
                    expect(AJS.$('body').css('overflow')).to.equal('visible');
                });

                it('is set to hidden on undim if it was originally hidden', function () {
                    AJS.$('body').css({'overflow': 'hidden'});
                    AJS.dim();
                    AJS.undim();
                    expect(AJS.$('body').css('overflow')).to.equal('hidden');
                });
            });

            describe('on <html>', function () {
                it('is reverted to visible on undim if it was originally visible', function () {
                    //have to query the dom for the default in this case because ie7 does not adhere to the spec
                    var overrideDefault = AJS.$('html').css('overflow');
                    AJS.dim();
                    AJS.undim();
                    expect(AJS.$('html').css('overflow')).to.equal(overrideDefault);
                });

                it('is set to hidden on undim if it was originally hidden', function () {
                    AJS.$('html').css({'overflow': 'hidden'});
                    AJS.dim();
                    AJS.undim();
                    expect(AJS.$('html').css('overflow')).to.equal('hidden');
                });
            });
        });
    });
});