/* jshint expr:true */
define(['jquery', 'aui/internal/skate', 'aui-navigation', 'aui-mocha'], function ($, skate) {
    'use strict';
    describe('Navigation Unit Tests -', function () {
        var $fixture;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            $fixture =  $('#test-fixture');
            $('<ul class="aui-nav">' +
                    '<li aria-expanded="false">' +
                        '<a href="#" class="aui-nav-subtree-toggle"><span class="aui-icon aui-icon-small aui-iconfont-expanded"></span></a>' +
                        '<a href="#" class="aui-nav-item"><span class="aui-icon aui-icon-small aui-iconfont-time"></span><span class="aui-nav-item-label">ITEM</span></a>' +
                        '<ul class="aui-nav" title="one" data-more="" data-more-limit="3">' +
                            '<li class="aui-nav-selected"><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                        '</ul>' +
                    '</li>' +
                '</ul>' +
                '<ul class="aui-nav">' +
                    '<li aria-expanded="false">' +
                        '<a href="#" class="aui-nav-subtree-toggle"><span class="aui-icon aui-icon-small aui-iconfont-expanded"></span></a>' +
                        '<a href="#" class="aui-nav-item"><span class="aui-icon aui-icon-small aui-iconfont-time"></span><span class="aui-nav-item-label">ITEM</span></a>' +
                        '<ul class="aui-nav" title="one" data-more="" data-more-limit="3">' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                            '<li><a href="home.html" class="aui-nav-item"><span class="aui-nav-item-label">ITEM</span></a></li>' +
                        '</ul>' +
                    '</li>' +
                '</ul>').appendTo($fixture);
            skate.init($fixture);
        });

        afterEach(function () {
            $fixture.remove();
        });

        // Expander tests
        it('Expander', function () {
            var $toggle = $fixture.find('>.aui-nav:first .aui-nav-subtree-toggle'),
                $expander = $fixture.find('>.aui-nav:first li[aria-expanded]');

            expect($expander.attr('aria-expanded')).to.equal('true');
            $toggle.click();
            expect($expander.attr('aria-expanded')).to.equal('false');
            $toggle.click();
            expect($expander.attr('aria-expanded')).to.equal('true');
        });

        // Make sure aui-nav-child-selected class is added
        it('Child Selected class', function () {
            expect($fixture.find('.aui-nav-selected').closest('li:not(.aui-nav-selected)').hasClass('aui-nav-child-selected')).to.be.true;
        });

        // 'More...' tests
        it('More Initialisation', function () {
            expect($fixture.find('>.aui-nav:last .aui-nav-more').length).to.be.defined;
        });

        it('No More Initialisation if selected', function () {
            expect($fixture.find('>.aui-nav:first .aui-nav-more').length).to.not.be.defined;
        });

        it('More Expansion', function () {
            $fixture.find('>.aui-nav:last .aui-nav-more a').click();

            expect($fixture.find('>.aui-nav:last .aui-nav-more').length).to.not.be.defined;
        });

        it('Show \'More\' again when re-expanded', function () {
            var $toggle = $fixture.find('>.aui-nav:last .aui-nav-subtree-toggle');

            $fixture.find('>.aui-nav:last .aui-nav-more a').click();

            expect($fixture.find('>.aui-nav:last .aui-nav-more').length).to.not.be.defined;

            $toggle.click();
            $toggle.click();

            expect($fixture.find('.aui-nav-more').length).to.be.defined;
        });
    });
});