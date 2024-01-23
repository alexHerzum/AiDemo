/* jshint expr:true */
define(['jquery', 'aui/internal/skate', 'aui/form-validation', 'aui-mocha'], function ($, skate, validator) {
    'use strict';
    describe('Form validation tests -', function () {
        var clock;
        beforeEach(function () {
            $('<div id="test-fixture"></div>').appendTo(document.body);
        });

        afterEach(function () {
            $('.tipsy').remove();
            $('#test-fixture').remove();
        });

        function makeValidationInput (attributes, $parent, inputHTML) {
            var html = inputHTML ? inputHTML : '<input type="text">';
            var $input = $(html);

            attributes = $.extend({}, attributes, {'data-aui-validation-field': '', 'data-aui-validation-when': 'keyup'});

            $.each(attributes, function(key, value) {
                $input.attr(key, value);
            });
            $parent.append($input);
            skate.init($input);
            skate.init($input);
            return $input;
        }

        function typeMessage ($input, messageToType) {
            $input.val(messageToType);
            $input.trigger('keyup');
            $input.focus();
        }

        function fieldIsValid ($input) {
            return $input.attr('data-aui-validation-state') === 'valid';
        }

        function fieldIsInvalid ($input) {
            return $input.attr('data-aui-validation-state') === 'invalid';
        }

        function fieldIsUnvalidated ($input) {
            return $input.attr('data-aui-validation-state') === 'unvalidated';
        }

        function tipsyOnPage () {
            return $('.tipsy').length > 0;
        }

        function firstTipsyOnPageMessage () {
            return $('.tipsy').first().text();
        }

        function iconsOnPage () {
            return $('[data-aui-notification-error] + .aui-icon-notification').length + $('[data-aui-notification-info] + .aui-icon-notification').length;
        }

        function errorIconsOnPage () {
            return AJS.$('[data-aui-notification-error]').length;
        }

        function successIconsOnPage () {
            return AJS.$('[data-aui-notification-success]').length - AJS.$('[data-aui-notification-success][data-aui-notification-error]').length;
        }

        function validateInput ($input) {
            validator.validate($input);
            clock.tick(1000); //Notifications appearing is not synchronous
        }

        describe('Form validation Unit Tests', function () {
            beforeEach(function () {
                try {
                    //Register validators for general usage
                    validator.register(['alwaysinvalidate'], function(field) {
                        field.invalidate('Invalid');
                    });
                } catch (e) {
                    //we expect an error as we try to register this plugin every time setup is called.
                    if (e.name !== 'FormValidationPluginError') {
                        throw e;
                    }
                }
                clock = sinon.useFakeTimers();
            });

            afterEach(function () {
                clock.restore();
            });

            it('Input fields start with unvalidated class', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'));

                expect(fieldIsUnvalidated($input)).to.be.true;
            });

            it('Input field becomes validated after typing valid message', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'));

                typeMessage($input, 'This is a message longer than twenty characters');
                expect(fieldIsValid($input)).to.be.true;
            });

            it('Input field becomes invalid after typing invalid message', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '100'
                }, $('#test-fixture'));

                typeMessage($input, 'This is a message shorter than one hundred characters');
                expect(fieldIsInvalid($input)).to.be.true;
            });

            it('Input field becomes invalid if one or two validation functions return invalid', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '5',
                    'data-aui-validation-dateformat': 'Y-m-d'
                }, $('#test-fixture'));

                typeMessage($input, 'A');
                expect(fieldIsInvalid($input)).to.be.true;
                typeMessage($input, 'AAAAAAAAAA');
                expect(fieldIsInvalid($input)).to.be.true;
            });

            it('Tooltip is shown when field is invalidated', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-maxlength': '20'
                }, $('#test-fixture'));

                typeMessage($input, 'This is a message longer than twenty characters');
                expect(tipsyOnPage()).to.be.true;
            });

            it('Icon is shown when icons needing fields are invalidated', function () {
                var $textInput = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'), '<input type="text">');
                typeMessage($textInput, 'Too short');
                expect(iconsOnPage()).to.equal(1);

                typeMessage($textInput, 'This is a message longer than twenty characters');
                expect(iconsOnPage()).to.equal(0);


                var $passwordInput = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'), '<input type="password">');
                typeMessage($passwordInput, 'Too short');
                expect(iconsOnPage()).to.equal(1);

                typeMessage($passwordInput, 'This is a message longer than twenty characters');
                expect(iconsOnPage()).to.equal(0);

                var $textareaInput = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'), '<textarea>');
                typeMessage($textareaInput, 'Too short');
                expect(iconsOnPage()).to.equal(1);

                typeMessage($textareaInput, 'This is a message longer than twenty characters');
                expect(iconsOnPage()).to.equal(0);
            });

            it('Invalidation is added to fields that are divs', function () {
                var $input = makeValidationInput({
                    'data-aui-validation-alwaysinvalidate': '20'
                }, $('#test-fixture'), '<div>');

                validateInput($input);
                expect(fieldIsInvalid($input)).to.be.true;

            });

            it('Plugged in validators can be used by fields', function () {
                validator.register(['testvalidator'], function(field){
                    if (field.$el.val().length !== 3) {
                        field.invalidate('not length three');
                    } else {
                        field.validate();
                    }
                });

                var $input = makeValidationInput({
                    'data-aui-validation-testvalidator': ''
                }, $('#test-fixture'));

                typeMessage($input, '1234');
                expect(fieldIsInvalid($input)).to.be.true;
                typeMessage($input, '123');
                expect(fieldIsValid($input)).to.be.true;
            });

            it('Manual revalidation works', function (){
                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '20'
                }, $('#test-fixture'));
                $input.val('too short');
                validateInput($input);
                expect(fieldIsInvalid($input)).to.be.true;
            });

            it('Whole form validation triggers validsubmit', function () {
                expect(1);

                var $form = $('<form></form>');
                $('#test-fixture').append($form);

                var $input = makeValidationInput({
                    'data-aui-validation-minlength': '1'
                }, $form);

                typeMessage($input, 'this message is long enough');

                $form.one('aui-valid-submit', function(e) {
                    e.preventDefault();
                    expect(true).to.be.true;
                });

                $form.trigger('submit');
            });

            it('A field with the "watchfield" argument should have validation triggered when the watched field would trigger validation', function () {
                var $input1 = AJS.$('<input id="input1"/>').appendTo('#test-fixture');
                var $input2 = makeValidationInput({
                    'data-aui-validation-matchingfield': 'input1',
                    'data-aui-validation-watchfield': 'input1'
                }, AJS.$('#test-fixture'));

                typeMessage($input1, 'mismatched message');
                typeMessage($input2, 'matching message');

                expect(fieldIsInvalid($input2)).to.be.true;
                typeMessage($input1, 'matching message');
                expect(fieldIsValid($input2)).to.be.true;
            });

            it('Cannot register plugins with reserved arguments', function () {
                var registeredValidator = validator.register(['watchfield'], function (){});
                expect(registeredValidator).to.be.false;
            });

            it('Custom error messages display correctly', function () {
                var maxValue = 20;
                var customMessage = 'Custom message, needs to be less than ';
                var customMessageUnformatted = customMessage + '{0}';
                var customMessageFormatted = customMessage + maxValue;

                var $input = makeValidationInput({
                    'data-aui-validation-max': maxValue,
                    'data-aui-validation-max-msg': customMessageUnformatted
                }, $('#test-fixture'));


                typeMessage($input, 'Invalid number');
                expect(fieldIsInvalid($input)).to.be.true;

                typeMessage($input, '21');
                expect(firstTipsyOnPageMessage()).to.equal(customMessageFormatted);
            });

            it('Errors and info notifications stack correctly', function () {

                var infoMessage = 'Enter a number lower than 20';
                var errorMessage = 'Must be a number lower than 20';

                var $input = makeValidationInput({
                    'data-aui-validation-max': 20,
                    'data-aui-validation-max-msg': errorMessage,
                    'data-aui-notification-info': infoMessage
                }, $('#test-fixture'));

                $input.focus();
                expect(firstTipsyOnPageMessage()).to.equal(infoMessage);
                typeMessage($input, '21');
                expect(firstTipsyOnPageMessage()).to.equal(errorMessage);
                typeMessage($input, '19');
                expect(firstTipsyOnPageMessage()).to.equal(infoMessage);
            });

            it('Fields that validate slowly show success indicators when they are validated', function () {
                validator.register(['slowvalidator'], function(field) {
                    setTimeout(function (){
                        field.validate();
                    }, 2000);
                });


                var $input = makeValidationInput({
                    'data-aui-validation-slowvalidator': ''
                }, AJS.$('#test-fixture'));

                typeMessage($input, '1234');
                clock.tick(1000);
                expect(successIconsOnPage()).to.equal(0);
                clock.tick(3000);
                expect(successIconsOnPage()).to.equal(1);
            });

            it('Fields that validate slowly show errors when they are invalidated', function () {
                validator.register(['slowinvalidator'], function(field) {
                    setTimeout(function (){
                        field.invalidate();
                    }, 2000);
                });

                var $input = makeValidationInput({
                    'data-aui-validation-slowinvalidator': ''
                }, AJS.$('#test-fixture'));

                typeMessage($input, '1234');
                clock.tick(1000);
                expect(errorIconsOnPage()).to.equal(0);
                clock.tick(3000);
                expect(errorIconsOnPage()).to.equal(1);
                expect(successIconsOnPage()).to.equal(0);
            });
        });

        describe('Form validation provided validators test', function () {
            beforeEach(function () {
                AJS.I18n.keys = {
                    'aui.validation.message.matchingfield': 'Shim {0} message {1}',
                    'aui.validation.message.matchingfield-novalue': 'Shim {0} no value message {1}'
                };
            });

            function setupPasswordFields() {
                var $password1 = $('<input type="password" id="password1">').appendTo(AJS.$('#test-fixture'));
                var $password2 = makeValidationInput({
                    'data-aui-validation-watch': 'password1',
                    'data-aui-validation-matchingfield': 'password1'
                }, $('#test-fixture'), '<input type="password">');

                return {
                    $password1: $password1,
                    $password2: $password2
                };
            }

            function setupPasswordAndTextFields() {
                var $textField = $('<input type="text" id="textField">');
                $('#test-fixture').append($textField);

                var $passwordField = makeValidationInput({
                    'data-aui-validation-watch': 'textField',
                    'data-aui-validation-matchingfield': 'textField'
                }, $('#test-fixture'), '<input type="password">');

                return {
                    $textField: $textField,
                    $passwordField: $passwordField
                };
            }

            function setupTextFields() {
                var $textField1 = $('<input type="text" id="textField">');
                $('#test-fixture').append($textField1);

                var $textField2 = makeValidationInput({
                    'data-aui-validation-watch': 'textField',
                    'data-aui-validation-matchingfield': 'textField'
                }, $('#test-fixture'), '<input type="text">');

                return {
                    $textField1: $textField1,
                    $textField2: $textField2
                };
            }

            it('Matching field validator should not leak password values', function () {
                var fields = setupPasswordFields();

                typeMessage(fields.$password1, 'password123');
                typeMessage(fields.$password2, 'password456');


                expect(tipsyOnPage(), 'There is a tipsy on the page after typing mismatched passwords');

                var message = firstTipsyOnPageMessage();
                var messageContainsPassword1 = message.indexOf('password123') !== -1;
                var messageContainsPassword2 = message.indexOf('password456') !== -1;

                expect(messageContainsPassword1).to.be.false;
                expect(messageContainsPassword2).to.be.false;
            });

            it('Matching field validator should not leak password values when one field is a password and the other is not', function () {
                var fields = setupPasswordAndTextFields();

                typeMessage(fields.$textField, 'inputA');
                typeMessage(fields.$passwordField, 'inputB');


                expect(tipsyOnPage(), 'There is a tipsy on the page after typing mismatched inputs');

                var message = firstTipsyOnPageMessage();
                var messageContainsPassword1 = message.indexOf('inputA') !== -1;
                var messageContainsPassword2 = message.indexOf('inputB') !== -1;

                expect(messageContainsPassword1).to.be.false;
                expect(messageContainsPassword2).to.be.false;
            });

            it('Matching field validator messages should contain the contents of both messages', function () {
                var fields = setupTextFields();

                typeMessage(fields.$textField1, 'inputA');
                typeMessage(fields.$textField2, 'inputB');

                var message = firstTipsyOnPageMessage();
                var messageContainsInput1 = message.indexOf('inputA') !== -1;
                var messageContainsInput2 = message.indexOf('inputB') !== -1;

                expect(messageContainsInput1).to.be.true;
                expect(messageContainsInput2).to.be.true;
            });
        });
    });
});