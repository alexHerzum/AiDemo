/**
 * Replaces tokens in a string with arguments, similar to Java's MessageFormat.
 * Tokens are in the form {0}, {1}, {2}, etc.
 *
 * This version also provides support for simple choice formats (excluding floating point numbers) of the form
 * {0,choice,0#0 issues|1#1 issue|1<{0,number} issues}
 *
 * Number format is currently not implemented, tokens of the form {0,number} will simply be printed as {0}
 *
 * @method format
 * @param message the message to replace tokens in
 * @param arg (optional) replacement value for token {0}, with subsequent arguments being {1}, etc.
 * @return {String} the message with the tokens replaced
 * @usage AJS.format("This is a {0} test", "simple");
 */
AJS.format = function (message) {
    var apos = /'(?!')/g, // founds "'", but not "''"
        simpleFormat = /^\d+$/,
        numberFormat = /^(\d+),number$/, // TODO: incomplete, as doesn't support floating point numbers
        choiceFormat = /^(\d+)\,choice\,(.+)/,
        choicePart = /^(\d+)([#<])(.+)/; // TODO: does not work for floating point numbers!
    // we are caching RegExps, so will not spend time on recreating them on each call

    // formats a value, currently choice and simple replacement are implemented, proper
    var getParamValue = function(format, args) {
        // simple substitute
        /*jshint boss:true */
        var res = '', match;
        if (match = format.match(simpleFormat)) { // TODO: heavy guns for checking whether format is a simple number...
            res = args.length > ++format ? args[format] : ''; // use the argument as is, or use '' if not found
        }

        // number format
        else if (match = format.match(numberFormat)) {
            // TODO: doesn't actually format the number...
            res = args.length > ++match[1] ? args[match[1]] : '';
        }

        // choice format
        else if (match = format.match(choiceFormat)) {
            // format: "0,choice,0#0 issues|1#1 issue|1<{0,number} issues"
            // match[0]: "0,choice,0#0 issues|1#1 issue|1<{0,number} issues"
            // match[1]: "0"
            // match[2]: "0#0 issues|1#1 issue|1<{0,number} issues"

            // get the argument value we base the choice on
            var value = (args.length > ++match[1] ? args[match[1]] : null);
            if (value !== null) {
                // go through all options, checking against the number, according to following formula,
                // if X < the first entry then the first entry is returned, if X > last entry, the last entry is returned
                //
                //    X matches j if and only if limit[j] <= X < limit[j+1]
                //
                var options = match[2].split('|');

                var prevOptionValue = null; // holds last passed option
                for (var i=0; i < options.length; i++) {
                    // option: "0#0 issues"
                    // part[0]: "0#0 issues"
                    // part[1]: "0"
                    // part[2]: "#"
                    // part[3]" "0 issues";
                    var parts = options[i].match(choicePart);

                    // if value is smaller, we take the previous value, or the current if no previous exists
                    var argValue = parseInt(parts[1], 10);
                    if (value < argValue) {
                        if (prevOptionValue) {
                            res = prevOptionValue;
                            break;
                        } else {
                            res = parts[3];
                            break;
                        }
                    }
                    // if value is equal the condition, and the match is equality match we accept it
                    if (value == argValue && parts[2] == '#') {
                        res = parts[3];
                        break;
                    }
                    else {
                        // value is greater the condition, fall through to next iteration
                    }

                    // check whether we are the last option, in which case accept it even if the option does not match
                    if (i == options.length - 1) {
                        res = parts[3];
                    }

                    // retain current option
                    prevOptionValue = parts[3];
                }

                // run result through format, as the parts might contain substitutes themselves
                var formatArgs = [res].concat(Array.prototype.slice.call(args, 1));
                res = AJS.format.apply(AJS, formatArgs);
            }
        }
        return res;
    };

    // drop in replacement for the token regex
    // splits the message to return the next accurance of a i18n placeholder.
    // Does not use regexps as we need to support nested placeholders
    // text between single ticks ' are ignored
    var _performTokenRegex = function(message) {
        var tick=false, openIndex=-1, openCount=0;
        for (var i=0; i < message.length; i++) {
            // handle ticks
            var c = message.charAt(i);
            if (c == "'") {
                // toggle
                tick = !tick;
            }
            // skip if we are between ticks
            if (tick) {
                continue;
            }
            // check open brackets
            if (c === '{') {
                if (openCount === 0) {
                    openIndex = i;
                }
                openCount++;
            }
            else if (c === '}') {
                if (openCount > 0) {
                    openCount--;
                    if (openCount === 0) {
                        // we found a bracket match - generate the result array (
                        var match = [];
                        match.push(message.substring(0, i+1)); // from begin to match
                        match.push(message.substring(0, openIndex)); // everything until match start
                        match.push(message.substring(openIndex+1, i)); // matched content
                        return match;
                    }
                }
            }
        }
        return null;
    };

    var _format = function (message) {
        var args = arguments,
            res = "",
            match = _performTokenRegex(message); //message.match(token);
        while (match) {
            // reduce message to string after match
            message = message.substring(match[0].length);

            // add value before match to result
            res += match[1].replace(apos, "");

            // add formatted parameter
            res += getParamValue(match[2], args);

            // check for next match
            match = _performTokenRegex(message); //message.match(token);
        }
        // add remaining message to result
        res += message.replace(apos, "");
        return res;
    };
    return _format.apply(AJS, arguments);
};


/**
 * Returns the value defined in AJS.I18n.keys for the given key. If AJS.I18n.keys does not exist, or if the given key does not exist,
 * the key is returned - this could occur in plugin mode if the I18n transform is not performed;
 * or in flatpack mode if the i18n JS file is not loaded.
 */
AJS.I18n = {
    getText: function(key) {
        var params = Array.prototype.slice.call(arguments, 1);
        if (AJS.I18n.keys && Object.prototype.hasOwnProperty.call(AJS.I18n.keys, key)) {
            return AJS.format.apply(null, [ AJS.I18n.keys[key] ].concat(params));
        }
        return key;
    }
};