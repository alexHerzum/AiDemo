/* jshint expr:true */
define(['aui/banner', 'jquery', 'aui-mocha'], function(banner, $) {
    'use strict';

    describe('Banner', function () {
        it('cannot be created unless a #header is present', function() {
            try {
                expect(banner({body: 'test'})).to.throw(Error);
            } catch (e) {
                expect(e.message && e.message.indexOf('header')).to.be.above(-1);
            }
        });

        describe('Messages', function () {
            var header;
            beforeEach(function() {
                $('<div id="test-fixture"></div>').appendTo(document.body);
                header = $('<div id="header"></div>');
                header.html('<p>test</p><nav class="aui-header"></nav>');
                $('#test-fixture').append(header);
            });

            afterEach(function () {
                $('#test-fixture').remove();
            });

            it('are jQuery elements', function() {
                var b = banner({ body: 'test banner' });
                expect(b).to.be.an.instanceof($);
            });

            it('are prepended to the header', function() {
                var b = banner({ body: 'test banner' });
                expect(header.children().length).to.equal(3);
                expect(header.children().get(0)).to.equal(b.get(0));
            });

            it('can have HTML content', function() {
                var b = banner({ body: 'with an <strong>important <a href="#">hyperlink</a></strong>!' });
                expect(b.text(), 'with an important hyperlink!');
                expect(b.find('strong').length).to.equal(1);
                expect(b.find('a').length).to.equal(1);
            });

            it('cannot be made closeable', function() {
                var b = banner({ body: 'try and close me bro', closeable: true });
                expect(b.children().length).to.equal(0);
            });
        });
    });
});
