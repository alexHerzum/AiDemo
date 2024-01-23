;(function(init) {
    'use strict';

    define(['./validator-register'], function(validatorRegister) {
        return init(AJS, AJS.$, validatorRegister);
    });
})(function (AJS, $, validatorRegister) {
    'use strict';

    //Input length
    validatorRegister.register(['maxlength', 'minlength'], function(field) {
        var minlengthMessage = makeMessage('minlength', field.args);
        var maxlengthMessage = makeMessage('maxlength', field.args);

        if (field.$el.val().length < field.args('minlength')){
            field.invalidate(minlengthMessage);
        } else if (field.$el.val().length > field.args('maxlength')){
            field.invalidate(maxlengthMessage);
        } else {
            field.validate();
        }
    });

    //Field matching
    validatorRegister.register(['matchingfield'], function(field){
        var thisFieldValue = field.$el.val();
        var $matchingField = $('#' + field.args('matchingfield'));
        var matchingFieldValue = $matchingField.val();

        var matchingFieldMessage = makeMessage('matchingfield', field.args, [thisFieldValue, matchingFieldValue]);

        var shouldHidePasswords = isPasswordField(field.$el) || isPasswordField($matchingField);
        if (shouldHidePasswords) {
            matchingFieldMessage = makeMessage('matchingfield-novalue', field.args);
        }

        if (!thisFieldValue || !matchingFieldValue){
            field.validate();
        } else if (matchingFieldValue !== thisFieldValue) {
            field.invalidate(matchingFieldMessage);
        } else {
            field.validate();
        }
    });

    function isPasswordField($field) {
        return $field.attr('type') === 'password';
    }

    //Banned words
    validatorRegister.register(['doesnotcontain'], function(field) {
        var doesNotContainMessage = makeMessage('doesnotcontain', field.args);

        if(field.$el.val().indexOf(field.args('doesnotcontain')) === -1) {
            field.validate();
        } else {
            field.invalidate(doesNotContainMessage);
        }
    });

    //Matches regex
    validatorRegister.register(['pattern'], function(field) {
        var patternMessage = makeMessage('pattern', field.args);

        if(matchesRegex(field.$el.val(), new RegExp(field.args('pattern'), 'i'))) {
            field.validate();
        } else {
            field.invalidate(patternMessage);
        }
    });

    function matchesRegex(val, regex){
        var matches = val.match(regex);
        if (!matches) {
            return false;
        }
        var isExactMatch = (val === matches[0]);
        return isExactMatch;
    }

    //Required field
    validatorRegister.register(['required'], function(field) {
        var requiredMessage = makeMessage('required', field.args);

        if (field.$el.val()) {
            field.validate();
        } else {
            field.invalidate(requiredMessage);
        }
    });

    //Field value range (between min and max)
    validatorRegister.register(['min', 'max'], function(field) {
        var validNumberMessage = makeMessage('validnumber', field.args);
        var belowMinMessage = makeMessage('min', field.args);
        var aboveMaxMessage = makeMessage('max', field.args);

        var fieldValue = parseInt(field.$el.val());
        if (isNaN(fieldValue)) {
            field.invalidate(validNumberMessage);
            return;
        }
        if (field.args('min') && (fieldValue < parseInt(field.args('min')))) {
            field.invalidate(belowMinMessage);
        } else if(field.args('max') && (fieldValue > parseInt(field.args('max')))){
            field.invalidate(aboveMaxMessage);
        } else {
            field.validate();
        }
    });

    //Date format
    validatorRegister.register(['dateformat'], function(field) {
        var dateFormatSymbolic = field.args('dateformat');
        var dateFormatMessage = makeMessage('dateformat', field.args);

        var symbolRegexMap = {
            'Y': '[0-9]{4}',
            'y': '[0-9]{2}',
            'm': '(11|12|0{0,1}[0-9])',
            'M': '[Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec]',
            'D': '[Mon|Tue|Wed|Thu|Fri|Sat|Sun]',
            'd': '([0-2]{0,1}[0-9]{1})|(30|31)'
        };

        var dateFormatSymbolArray = dateFormatSymbolic.split('');
        var dateFormatRegexString = '';

        dateFormatSymbolArray.forEach(function(dateSymbol) {
            var isRecognisedSymbol = symbolRegexMap.hasOwnProperty(dateSymbol);
            if (isRecognisedSymbol) {
                dateFormatRegexString += symbolRegexMap[dateSymbol];
            } else {
                dateFormatRegexString += dateSymbol;
            }
        });

        var dateFormatRegex = new RegExp(dateFormatRegexString+'$', 'i');
        var isValidDate = matchesRegex(field.$el.val(), dateFormatRegex);

        if (isValidDate) {
            field.validate();
        } else {
            field.invalidate(dateFormatMessage);
        }
    });

    //Checkbox count
    validatorRegister.register(['minchecked', 'maxchecked'], function(field) {
        var amountChecked = field.$el.find(':checked').length;
        var aboveMin = !field.args('minchecked') || (amountChecked >= field.args('minchecked'));
        var belowMax = !field.args('maxchecked') || (amountChecked <= field.args('maxchecked'));

        var belowMinMessage = makeMessage('minchecked', field.args);
        var aboveMaxMessage = makeMessage('maxchecked', field.args);

        if (aboveMin && belowMax) {
            field.validate();
        } else if (!aboveMin) {
            field.invalidate(belowMinMessage);
        } else if (!belowMax) {
            field.invalidate(aboveMaxMessage);
        }
    });

    /*
         Retrieves a message for a plugin validator through the data attributes or the default (which is in the i18n file)
     */
    function makeMessage(key, accessorFunction, customTokens) {
        var inFlatpackMode = AJS.I18n.keys !== undefined;
        var defaultMessage;
        if (inFlatpackMode) {
            defaultMessage = AJS.I18n.keys['aui.validation.message.' + key];
        } else {
            defaultMessage = pluginI18nMessages[key];
        }

        var messageTokens = customTokens;
        if (!customTokens) {
            messageTokens = [accessorFunction(key)];
        }

        var customMessageUnformatted = accessorFunction(key+'-msg');
        var formattingArguments;

        if (customMessageUnformatted) {
            formattingArguments = [customMessageUnformatted].concat(messageTokens);
        } else {
            formattingArguments = [defaultMessage].concat(messageTokens);
        }

        return AJS.format.apply(null, formattingArguments);
    }

    /*
     The value AJS.I18n.getText('aui.validation.message...') (defaultMessage) cannot be refactored as it
     must appear verbatim for the plugin I18n transformation to pick it up
     */
    var pluginI18nMessages = {
        minlength: AJS.I18n.getText('aui.validation.message.minlength'),
        maxlength: AJS.I18n.getText('aui.validation.message.maxlength'),
        matchingfield: AJS.I18n.getText('aui.validation.message.matchingfield'),
        'matchingfield-novalue': AJS.I18n.getText('aui.validation.message.matchingfield-novalue'),
        doesnotcontain: AJS.I18n.getText('aui.validation.message.doesnotcontain'),
        pattern: AJS.I18n.getText('aui.validation.message.pattern'),
        required: AJS.I18n.getText('aui.validation.message.required'),
        validnumber: AJS.I18n.getText('aui.validation.message.validnumber'),
        min: AJS.I18n.getText('aui.validation.message.min'),
        max: AJS.I18n.getText('aui.validation.message.max'),
        dateformat: AJS.I18n.getText('aui.validation.message.dateformat'),
        minchecked: AJS.I18n.getText('aui.validation.message.minchecked'),
        maxchecked: AJS.I18n.getText('aui.validation.message.maxchecked')
    };

});