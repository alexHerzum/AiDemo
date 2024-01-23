/* jshint expr:true */
define([
    'jquery',
    'underscore',
    'aui/internal/skate',
    'aui/checkbox-multiselect',
    'aui-mocha'
], function ($, _, skate) {
    'use strict';

    describe('Checkbox Multiselect -', function () {
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('aui-checkbox-multiselect, .aui-checkbox-multiselect-dropdown').remove();
            $('#test-fixture').remove();
        });

        function createSelect (options) {
            var $select = $('<aui-checkbox-multiselect />').attr({
                'name': 'test-case'
            });

            _.each(options.items, function (option) {
                var $option = $('<option data-test="foo"></option>')
                    .attr('value', option.value)
                    .text(option.label)
                    .appendTo($select);

                if (option.selected) {
                    $option.attr('selected', 'selected');
                }
            });

            return $select;
        }

        function createTestCase (options) {

            var $select = createSelect(options).appendTo('#test-fixture');

            skate.init($select[0]);

            var $dropdown = $('.aui-checkbox-multiselect-dropdown');
            var $button = $('.aui-checkbox-multiselect-btn');

            return {
                getButtonText: function () {
                    return $button.text();
                },
                openDropdown: function () {
                    if (!$dropdown.is('[aria-hidden=false]')) {
                        $button.click();
                    }
                    return this;
                },
                closeDropdown: function () {
                    if ($dropdown.is('[aria-hidden=false]')) {
                        $button.click();
                    }
                },
                clearSelected: function () {
                    $dropdown.find('[data-aui-checkbox-multiselect-clear]').click();
                    return this;
                },
                getSelectedOptions: function () {
                    return _.map($select.find(':selected'), function (item) {
                        return $(item).text();
                    });
                },
                getCheckedItems: function () {
                    return _.map($dropdown.find('.aui-dropdown2-checked'), function (item) {
                        return $(item).text();
                    });
                },
                getUncheckedItems: function () {
                    return _.map($dropdown.find('.aui-dropdown2-checkbox:not(.aui-dropdown2-checked)'), function (item) {
                        return $(item).text();
                    });
                },
                clickItem: function (value) {
                    $dropdown.find('.aui-dropdown2-checkbox').filter(function () {
                        return $(this).text() === value;
                    }).click();
                    return this;
                },
                isClearSelectedEnabled: function () {
                    return !$dropdown.find('[data-aui-checkbox-multiselect-clear]').prop('disabled');
                }
            };
        }

        it('Initial Render - Single Selected Item', function () {
            var testCase = createTestCase({
                items: [
                    {label: 'Surf', value: 1, selected: true},
                    {label: 'Skate', value: 2},
                    {label: 'Snow', value: 3}
                ]
            });
            expect(testCase.getButtonText()).to.equal('Surf');
            testCase.openDropdown();
            expect(testCase.getCheckedItems()).to.deep.equal(['Surf']);
            expect(testCase.getUncheckedItems()).to.deep.equal(['Skate', 'Snow']);
            expect(testCase.isClearSelectedEnabled()).to.be.true;
            testCase.closeDropdown();
        });

        it('Initial Render - Multiple Selected Items', function () {
            var testCase = createTestCase({
                items: [
                    {label: 'Surf', value: 1, selected: true},
                    {label: 'Skate', value: 2, selected: true},
                    {label: 'Snow', value: 3, selected: true}
                ]
            });
            expect(testCase.getButtonText()).to.equal('Surf, Skate, Snow');
            testCase.openDropdown();
            expect(testCase.getCheckedItems()).to.deep.equal(['Surf', 'Skate', 'Snow']);
            expect(testCase.getUncheckedItems()).to.deep.equal([]);
            expect(testCase.isClearSelectedEnabled()).to.be.true;
            testCase.closeDropdown();
        });

        it('Initial Render - No Selected Items', function () {
            var testCase = createTestCase({
                items: [
                    {label: 'Surf', value: 1},
                    {label: 'Skate', value: 2},
                    {label: 'Snow', value: 3}
                ]
            });
            expect(testCase.getButtonText()).to.equal('All');
            testCase.openDropdown();
            expect(testCase.getCheckedItems()).to.deep.equal([]);
            expect(testCase.getUncheckedItems()).to.deep.equal(['Surf', 'Skate', 'Snow']);
            expect(testCase.isClearSelectedEnabled()).to.be.false;
            testCase.closeDropdown();
        });


        it('Clearing All', function () {
            var testCase = createTestCase({
                items: [
                    {label: 'Surf', value: 1, selected: true},
                    {label: 'Skate', value: 2, selected: true},
                    {label: 'Snow', value: 3}
                ]
            });
            expect(testCase.openDropdown().clearSelected().getSelectedOptions()).to.deep.equal([]);
            testCase.closeDropdown();
        });

        it('Selecting/Unselecting Items', function () {
            var testCase = createTestCase({
                items: [
                    {label: 'Surf', value: 1},
                    {label: 'Skate', value: 2},
                    {label: 'Snow', value: 3}
                ]
            });

            testCase.openDropdown().clickItem('Surf');
            expect(testCase.getCheckedItems()).to.deep.equal(['Surf']);
            expect(testCase.getButtonText()).to.equal('Surf');

            testCase.clickItem('Surf');
            expect(testCase.getCheckedItems()).to.deep.equal([]);
            expect(testCase.getButtonText()).to.equal('All');

            testCase.clickItem('Skate');
            expect(testCase.getCheckedItems()).to.deep.equal(['Skate']);
            expect(testCase.getButtonText()).to.equal('Skate');

            testCase.clickItem('Snow');
            expect(testCase.getCheckedItems()).to.deep.equal(['Skate', 'Snow']);
            expect(testCase.getButtonText()).to.equal('Skate, Snow');
            testCase.closeDropdown();

        });
    });
});