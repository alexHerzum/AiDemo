/* jshint expr:true */
define(['forms', 'soy/form', 'aui-mocha'], function () {
    'use strict';
    describe('Forms Unit Tests -', function () {
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('#test-fixture').remove();
        });

        function setupInlineHelpTest () {
            AJS.$('#test-fixture').html(
                    '<form class="aui">' +
                    '<span id="fieldHelpToggle" class="aui-icon icon-inline-help"><span>Help</span></span>' +
                    '<span id="field-help" class="field-help hidden">Inline help text here.</span>' +
                    '</form>'
            );
            AJS.inlineHelp();
        }

        function setupDescriptionContentTest () {
            //Add HTML for escaped form description testing
            var descriptionContentFormHTML = aui.form.form({
                action : '#form',
                id : 'descriptionContent-text-field',
                content : aui.form.textField({
                    labelContent : 'Text Field, with description text (escaped)',
                    descriptionContent: 'This is some description <a href="example.com">with a link</a>, which should be escaped'
                })
            });
            AJS.$('#test-fixture').append(descriptionContentFormHTML);
        }

        function setupDescriptionTextTest () {
            //Add HTML for escaped form description testing
            var descriptionTextFormHTML = aui.form.form({
                action : '#form',
                id : 'descriptionText-text-field',
                content : aui.form.textField({
                    labelContent : 'Text Field, with description text (escaped)',
                    descriptionText: 'This is some description <a href="example.com">with a link</a>, which should be escaped'
                })
            });
            AJS.$('#test-fixture').append(descriptionTextFormHTML);
        }

        function setupShortDescriptionTest () {
            var descriptionContentFormHTML = aui.form.form({
                action : '#form',
                id : 'short-description-text-field',
                content : aui.form.textField({
                    labelContent : 'Text Field, with description text (short)',
                    descriptionContent: 'This is a short description'
                })
            });
            AJS.$('#test-fixture').append(descriptionContentFormHTML);
        }

        it('inlineHelp should toggle visibility on click', function () {
            setupInlineHelpTest();

            var fieldHelpToggle = AJS.$('#fieldHelpToggle');
            var fieldHelp = AJS.$('#field-help');

            expect(fieldHelp.hasClass('hidden')).to.be.true;
            fieldHelpToggle.click();
            expect(fieldHelp.hasClass('hidden')).to.be.false;
            fieldHelpToggle.click();
            expect(fieldHelp.hasClass('hidden')).to.be.true;
        });



        it('descriptionContent should be appended to the form', function () {
            setupDescriptionContentTest();

            var $descriptionContent = AJS.$('#test-fixture').find('#descriptionContent-text-field');
            var endAnchorUnescaped = '</a>';
            var endAnchorEscaped = '&lt;/a&gt;';


            //Content should be unescaped
            expect($descriptionContent.find('.description').html().indexOf(endAnchorEscaped)).to.equal(-1);
            expect($descriptionContent.find('.description').html().indexOf(endAnchorUnescaped)).to.not.equal(-1);
        });

        it('descriptionText should be present in the text-field', function () {
            setupDescriptionTextTest();
            var $descriptionText = AJS.$('#test-fixture').find('#descriptionText-text-field');

            var endAnchorUnescaped = '</a>';
            var endAnchorEscaped = '&lt;/a&gt;';

            //Text should be escaped
            expect($descriptionText.find('.description').html().indexOf(endAnchorEscaped)).to.not.equal(-1);
            expect($descriptionText.find('.description').html().indexOf(endAnchorUnescaped)).to.equal(-1);
        });

        it('short description should be properly inserted in the form element', function () {
            setupShortDescriptionTest();
            var $shortDescription = AJS.$('#test-fixture').find('#short-description-text-field');

            //The field should contain the whole string (and nothing more)
            expect($shortDescription.find('.description').html()).to.equal('This is a short description');
        });

        it('select template with default value should construct the correct form', function () {
            AJS.$(aui.form.select({
                id: 'test-select',
                value: '2.5',
                options:
                    [
                        {
                            text: '1.1',
                            value: '1.1'
                        },
                        {
                            text: '2.5',
                            value: '2.5'
                        }
                    ]
                })).appendTo('#test-fixture');

            var value = AJS.$('#test-select').find(':selected').text();
            expect(value).to.equal('2.5');
        });

        it('select template with default value for optGroup should construct the correct form', function () {
            AJS.$(aui.form.select({
                id: 'test-select',
                value: '3.5',
                options: [{
                    text: 'group1',
                    options: [
                        {
                            text: '1.1',
                            value: '1.1'
                        },
                        {
                            text: '2.5',
                            value: '2.5'
                        }
                    ]
                },
                {
                    text: 'group2',
                    options: [
                        {
                            text: '3.5',
                            value: '3.5'
                        },
                        {
                            text: '4.5',
                            value: '4.5'
                        }
                    ]
                }]
            })).appendTo('#test-fixture');

            var value = AJS.$('#test-select').find(':selected').text();
            expect(value).to.equal('3.5');
        });

        it('select with disabled option should render a form with a disabled option', function () {
            AJS.$(aui.form.select({
                id: 'test-select',
                options:
                    [
                        {
                            text: '1.5',
                            value: '1.5',
                            disabled: true
                        },
                        {
                            text: '2.5',
                            value: '2.5'
                        }
                    ]
                })).appendTo('#test-fixture');

            var disabledValue = AJS.$('#test-select').find(':disabled').text();
            expect(disabledValue).to.equal('1.5');
        });

        it('select with disabled option inside optGroup should render a form with a disabled option inside optGroup', function () {
            AJS.$(aui.form.select({
                id: 'test-select',
                options: [{
                    text: 'group1',
                    options: [
                        {
                            text: '1.5',
                            value: '1.5'
                        }
                    ]
                },
                {
                    text: 'group2',
                    options: [
                        {
                            text: '2.5',
                            value: '2.5',
                            disabled: true
                        },
                        {
                            text: '3.5',
                            value: '3.5'
                        }
                    ]
                }]
            })).appendTo('#test-fixture');

            var disabledValue = AJS.$('#test-select').find(':disabled').text();
            expect(disabledValue).to.equal('2.5');
        });

        it('select with disabled optGroup should render a form with disabled optGroup', function () {
            AJS.$(aui.form.select({
                id: 'test-select',
                options: [{
                    text: 'group',
                    disabled: true,
                    options: [
                        {
                            text: '1.5',
                            value: '1.5'
                        },
                        {
                            text: '2.5',
                            value: '2.5'
                        }
                    ]
                }]
            })).appendTo('#test-fixture');

            var disabledCount = AJS.$('#test-select').find(':disabled').length;
            expect(disabledCount).to.equal(3);
        });
    });
});