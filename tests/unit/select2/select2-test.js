/* jshint expr:true */
define(['aui-select2', 'aui-mocha'], function () {
    'use strict';
    describe('AUI Select2', function () {
        var $fixture;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            $fixture =  $('#test-fixture');
            $('<select />').appendTo($fixture);
        });

        afterEach(function () {
            $fixture.remove();
        });

        it('exists', function () {
            expect($.fn.auiSelect2).to.be.a('function');
        });

        it('can be created', function () {
            var $select = $('select', $fixture);
            $select.auiSelect2();
            expect($select.prev('.aui-select2-container').length).to.be.above(0);
        });

        // Extra spaces in class attribute will cause an <input type="hidden"> with select2 applied to it  to not close in FF
        // try the below example in the sandbox
        it('with appended custom AUI classes', function () {
            var $input = $('<input>').attr('type', 'hidden');
            $input.appendTo(this.$fixture);
            $input.auiSelect2({
                data: [
                    {
                        id: 1,
                        text: 'one'
                    },
                    {
                        id: 2,
                        text: 'two'
                    }
                ]
            });
            expect(/\s\s+/.test($input.prev().attr('class'))).to.be.false;
        });
    });
});