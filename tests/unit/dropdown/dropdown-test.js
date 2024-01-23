/* jshint expr:true */
define(['dropdown', 'aui-mocha'], function () {
    'use strict';
    describe('Dropdown', function () {
        var dropdown;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
            AJS.$('#test-fixture').html(
                '<ul id="dropdown-test">' +
                    '<li class="aui-dd-parent">' +
                        '<a href="#" class="aui-dd-trigger">A Test Dropdown</a>' +
                        '<ul class="aui-dropdown">' +
                            '<li class="dropdown-item"><a href="#" class="item-link">Link 1</a></li>' +
                            '<li class="dropdown-item"><a href="#" class="item-link">Link 2</a></li>' +
                            '<li class="dropdown-item"><a href="#" class="item-link">Link 3</a></li>' +
                        '</ul>' +
                    '</li>' +
                '</ul>'
            );
            dropdown = AJS.$('#dropdown-test').dropDown('Standard')[0];
        });

        afterEach(function () {
            dropdown.hide();
            $('#test-fixture').remove();
        });

        it('creation', function () {
            var testDropdown = AJS.dropDown('#dropdown-test', 'standard');
            expect(testDropdown).to.be.an('array');
        });

        it('move down', function () {
            AJS.$('#dropdown-test .aui-dd-trigger').click();
            dropdown.moveDown();
            var dropdownItems = AJS.$('.dropdown-item'),
                selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[0]);

            dropdown.cleanActive();
            dropdown.moveDown();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[1]);

            dropdown.cleanActive();
            dropdown.moveDown();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[2]);

            dropdown.cleanActive();
            dropdown.moveDown();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[0]);
        });

        it('move up', function () {
            AJS.$('#dropdown-test .aui-dd-trigger').click();
            dropdown.moveUp();
            var dropdownItems = AJS.$('.dropdown-item'),
                selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[2]);

            dropdown.cleanActive();
            dropdown.moveUp();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[1]);

            dropdown.cleanActive();
            dropdown.moveUp();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[0]);

            dropdown.cleanActive();
            dropdown.moveUp();
            selectedItem = AJS.$('.dropdown-item.active');
            expect(selectedItem.length).to.equal(1);
            expect(selectedItem[0]).to.equal(dropdownItems[2]);
        });
    });
});