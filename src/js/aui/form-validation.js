;(function(init) {
    'use strict';

    define(['./form-validation/validator-register', './form-validation/basic-validators', './form-notification'], function(validatorRegister) {
        return init(AJS.$, window.skate, validatorRegister);
    });
})(function ($, skate, validatorRegister) {
    'use strict';

    //Attributes
    var ATTRIBUTE_VALIDATION_OPTION_PREFIX = 'aui-validation-';
    var ATTRIBUTE_NOTIFICATION_PREFIX = 'data-aui-notification-';

    var ATTRIBUTE_FIELD_STATE = 'aui-validation-state';
    var INVALID = 'invalid';
    var VALID = 'valid';
    var VALIDATING = 'validating';
    var UNVALIDATED = 'unvalidated';

    var ATTRIBUTE_VALIDATION_FIELD_COMPONENT = 'data-aui-validation-field';

    //Classes
    var CLASS_VALIDATION_INITIALISED = '_aui-form-validation-initialised';

    //Events
    var EVENT_FIELD_STATE_CHANGED = '_aui-internal-field-state-changed';

    function isFieldInitialised($field) {
        return $field.hasClass(CLASS_VALIDATION_INITIALISED);
    }

    function initValidation($field) {
        if (!isFieldInitialised($field)) {
            initialiseDisplayField($field);
            prepareFieldMarkup($field);
            bindFieldEvents($field);
            changeFieldState($field, UNVALIDATED);
        }
    }

    function initialiseDisplayField($field) {
        getDisplayField($field).attr('data-aui-notification-field', '');
    }

    function prepareFieldMarkup($field){
        $field.addClass(CLASS_VALIDATION_INITIALISED);
    }

    function bindFieldEvents($field) {
        bindStopTypingEvent($field);
        bindValidationEvent($field);
    }

    function bindStopTypingEvent($field){
        var keyUpTimer;

        var triggerStopTypingEvent = function(){
            $field.trigger('aui-stop-typing');
        };

        $field.on('keyup', function(){
            clearTimeout(keyUpTimer);
            keyUpTimer = setTimeout(triggerStopTypingEvent, 1500);
        });
    }

    function bindValidationEvent($field) {
        var validateWhen = getValidationOption($field, 'when');
        var watchedFieldID = getValidationOption($field, 'watchfield');

        var watchElements = watchedFieldID ? $field.add('#' + watchedFieldID) : $field;

        watchElements.on(validateWhen, makeStartValidationHandler($field));
    }

    function makeStartValidationHandler($field) {
        return function() {
            var noValidate = getValidationOption($field, 'novalidate');

            if (noValidate) {
                return;
            }

            startValidating($field);
        };
    }

    function getValidationOption($field, option) {
        var defaults = {
            'when': 'change'
        };
        var optionValue = $field.data(ATTRIBUTE_VALIDATION_OPTION_PREFIX + option);
        if (!optionValue) {
            optionValue = defaults[option];
        }

        return optionValue;
    }

    function startValidating($field) {
        clearFieldMessages($field);

        var validatorsToRun = getActivatedValidators($field);

        changeFieldState($field, VALIDATING);

        var deferreds = runValidatorsAndGetDeferred($field, validatorsToRun);
        $.when.apply($, deferreds).done(function(){
            changeFieldState($field, VALID);
        });
    }

    function clearFieldMessages($field) {
        setFieldNotification(getDisplayField($field), 'none');
    }

    function getValidators() {
        return validatorRegister.validators();
    }

    function getActivatedValidators($field) {
        var callList = [];
        getValidators().forEach(function(validator, index) {
            var validatorTrigger = validator.validatorTrigger;
            var runThisValidator = $field.is(validatorTrigger);
            if (runThisValidator) {
                callList.push(index);
            }
        });

        return callList;
    }

    function runValidatorsAndGetDeferred($field, validatorsToRun) {
        var allDeferreds = [];

        validatorsToRun.forEach(function(validatorIndex) {
            var validatorFunction = getValidators()[validatorIndex].validatorFunction;
            var deferred = new $.Deferred();
            var validatorContext = createValidatorContext($field, deferred);
            validatorFunction(validatorContext);

            allDeferreds.push(deferred);
        });

        return allDeferreds;
    }

    function createValidatorContext($field, validatorDeferred) {
        return {
            validate: function(){
                validatorDeferred.resolve();
            },
            invalidate: function(message){
                changeFieldState($field, INVALID, message);
                validatorDeferred.reject();
            },
            args: createArgumentAccessorFunction($field),
            $el: $field
        };
    }

    function createArgumentAccessorFunction($field) {
        return function(arg) {
            return $field.data(ATTRIBUTE_VALIDATION_OPTION_PREFIX + arg);
        };
    }

    function changeFieldState($field, state, message) {
        $field.attr('data-'+ATTRIBUTE_FIELD_STATE, state);

        if (state === UNVALIDATED) {
            return;
        }

        $field.trigger($.Event(EVENT_FIELD_STATE_CHANGED));

        var $displayField = getDisplayField($field);

        var stateToNotificationTypeMap = {};
        stateToNotificationTypeMap[VALIDATING] = 'wait';
        stateToNotificationTypeMap[INVALID] = 'error';
        stateToNotificationTypeMap[VALID] = 'success';

        var notificationType = stateToNotificationTypeMap[state];

        if (state === VALIDATING) {
            showSpinnerIfSlow($field);
        } else {
            setFieldNotification($displayField, notificationType, message);
        }

    }

    function showSpinnerIfSlow($field) {
        setTimeout(function() {
            var stillValidating = getFieldState($field) === VALIDATING;
            if (stillValidating) {
                setFieldNotification($field, 'wait');
            }
        }, 500);
    }

    function setFieldNotification($field, type, message) {
        var spinnerWasVisible = isSpinnerVisible($field);
        removeIconOnlyNotifications($field);
        var skipShowingSuccessNotification = (type === 'success') && !spinnerWasVisible;
        if (skipShowingSuccessNotification) {
            return;
        }

        if (type === 'none') {
            removeFieldNotification($field, 'error');
        } else {
            var previousMessage = $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type) || '[]';
            var newMessage = message ? combineJSONMessages(message, previousMessage) : '';
            $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type, newMessage);
        }
    }

    function removeIconOnlyNotifications($field) {
        removeFieldNotification($field, 'wait');
        removeFieldNotification($field, 'success');
    }

    function removeFieldNotification($field, type) {
        $field.removeAttr(ATTRIBUTE_NOTIFICATION_PREFIX + type);
    }

    function isSpinnerVisible($field) {
        return $field.is('[' + ATTRIBUTE_NOTIFICATION_PREFIX + 'wait]');
    }

    function combineJSONMessages(newString, previousString) {
        var previousStackedMessageList = JSON.parse(previousString);
        var newStackedMessageList = previousStackedMessageList.concat([newString]);
        var newStackedMessage = JSON.stringify(newStackedMessageList);
        return newStackedMessage;
    }

    function getDisplayField($field){
        var displayFieldID = getValidationOption($field, 'displayfield');
        var notifyOnSelf = (displayFieldID === undefined);
        return notifyOnSelf ? $field : $('#'+displayFieldID);
    }

    function getFieldState($field) {
        return $field.attr('data-'+ATTRIBUTE_FIELD_STATE);
    }

    /**
     * Trigger validation on a field manually
     * @param $field the field that validation should be triggered for
     */
    function validateField($field) {
        makeStartValidationHandler($field)();
    }

    /**
     * Form scrolling and submission prevent based on validation state
     * -If the form is unvalidated, validate all fields
     * -If the form is invalid, go to the first invalid element
     * -If the form is validating, wait for them to validate and then try submitting again
     * -If the form is valid, allow form submission
     */
    $(document).on('submit', function(e) {
        var form = e.target;
        var $form = $(form);

        var formState = getFormStateName($form);
        if (formState === UNVALIDATED) {
            validateUnvalidatedFields($form);
            delayFormSubmission($form, e);
        } else if (formState === VALIDATING) {
            delayFormSubmission($form, e);
        } else if (formState === INVALID) {
            e.preventDefault();
            selectFirstInvalid($form);
        } else if (formState === VALID) {
            var validSubmitEvent = $.Event('aui-valid-submit');
            $form.trigger(validSubmitEvent);
            var preventNormalSubmit = validSubmitEvent.isDefaultPrevented();
            if (preventNormalSubmit) {
                e.preventDefault(); //users can bind to aui-valid-submit for ajax forms
            }
        }
    });

    function delayFormSubmission($form, event) {
        event.preventDefault();
        var isFormValidating = getFormStateName($form) === VALIDATING;
        if (!isFormValidating) {
            $form.trigger('submit');
        } else {
            $form.one(EVENT_FIELD_STATE_CHANGED, function() {
                $form.trigger('submit');
            });
        }
    }

    function getFormStateName($form) {
        var $fieldCollection = $form.find('.' + CLASS_VALIDATION_INITIALISED);
        var fieldStates = getFieldCollectionStateNames($fieldCollection);
        var wholeFormState = mergeStates(fieldStates);
        return wholeFormState;
    }

    function getFieldCollectionStateNames($fields) {
        var states = $.map($fields, function(field) {
            return getFieldState($(field));
        });
        return states;
    }

    function mergeStates(stateNames) {
        var containsInvalidState = stateNames.indexOf(INVALID) !== -1;
        var containsUnvalidatedState = stateNames.indexOf(UNVALIDATED) !== -1;
        var containsValidatingState = stateNames.indexOf(VALIDATING) !== -1;
        var containsValidState = stateNames.indexOf(VALID) !== -1;

        if (containsInvalidState) {
            return INVALID;
        } else if (containsUnvalidatedState) {
            return UNVALIDATED;
        } else if (containsValidatingState) {
            return VALIDATING;
        } else if (containsValidState) {
            return VALID;
        }
    }

    function validateUnvalidatedFields($form) {
        var $unvalidatedElements = getFieldsInFormWithState($form, UNVALIDATED);
        $unvalidatedElements.each(function(index, el) {
            validator.validate($(el));
        });
    }

    function selectFirstInvalid($form) {
        var $firstInvalidField = getFieldsInFormWithState($form, INVALID).first();
        $firstInvalidField.focus();
    }

    function getFieldsInFormWithState($form, state) {
        var selector = '[data-'+ATTRIBUTE_FIELD_STATE+'='+state+']';
        return $form.find(selector);
    }


    var validator = {
        register: validatorRegister.register,
        validate: validateField
    };

    skate(ATTRIBUTE_VALIDATION_FIELD_COMPONENT, {
        insert: function(field) {
            var $field = $(field);
            initValidation($field);
            skate.init(field); //needed to kick off form notification skate initialisation
        },
        type: skate.types.ATTR
    });


    return validator;
});
