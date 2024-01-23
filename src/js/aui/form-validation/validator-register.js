define([], function() {
    'use strict';

    var $ = AJS.$; // Can't depend on jQuery since it won't be defined in product environments (thanks to deletion of the define.amd object)

    var ATTRIBUTE_RESERVED_ARGUMENTS = ['displayfield', 'watchfield', 'when', 'novalidate', 'state'];
    var validators = [];

    function getReservedArgument (validatorArguments) {
        var reservedArgument = false;
        validatorArguments.some(function(arg) {
            var isReserved = $.inArray(arg, ATTRIBUTE_RESERVED_ARGUMENTS) !== -1;
            if (isReserved) {
                reservedArgument = arg;
            }
            return isReserved;
        });
        return reservedArgument;
    }

    /**
     * Register a validator that can be used to validate fields. The main entry point for validator plugins.
     * @param trigger - when to run the validator. Can be an array of arguments, or a selector
     * @param validatorFunction - the function that will be called on the field to determine validation. Receives
     *      field - the field that is being validated
     *      args - the arguments that have been specified in HTML markup.
     */
    function registerValidator (trigger, validatorFunction) {
        var triggerSelector;
        if (typeof trigger === 'string') {
            triggerSelector = trigger;
        } else {
            var reservedArgument = getReservedArgument(trigger);
            if (reservedArgument) {
                console.warn('Validators cannot be registered with the argument "' + reservedArgument + '", as it ' +
                    'is a reserved argument.');
                return false;
            }
            triggerSelector = '[data-aui-validation-' + trigger.join('],[data-aui-validation-') + ']';
        }

        var validator = {
            validatorFunction: validatorFunction,
            validatorTrigger: triggerSelector
        };

        validators.push(validator);

        return validator;
    }

    return {
        register: registerValidator,
        validators: function() {
            return validators;
        }
    };

});