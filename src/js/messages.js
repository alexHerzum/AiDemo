;(function (exports, $) {
    'use strict';

    var DEFAULT_FADEOUT_DURATION = 500;
    var DEFAULT_FADEOUT_DELAY = 5000;
    var FADEOUT_RESTORE_DURATION = 100;

    var MESSAGE_TEMPLATE =
        '<div class="aui-message aui-message-{type} {type} {closeable} {shadowed} {fadeout}">' +
            '<p class="title">' +
                '<strong>{title}</strong>' +
            '</p>' +
            '{body}<!-- .aui-message -->' +
        '</div>';

    function createMessageConstructor(type) {
        /**
         *
         * @param context
         * @param {Object} obj - message configuration
         * @param {boolean} [obj.id] - ID to add to the message
         * @param {boolean} obj.body - Content of the message
         * @param {boolean} [obj.closeable]
         * @param {boolean} [obj.shadowed]
         * @param {boolean} [obj.fadeout]
         * @param {boolean} [obj.duration]
         * @param {boolean} [obj.delay]
         * @returns {*|HTMLElement}
         */
        exports.messages[type] = function (context, obj) {
            if (!obj) {
                obj = context;
                context = '#aui-message-bar';
            }

            // Set up our template options
            obj.closeable = (obj.closeable !== false);
            // shadowed no longer does anything but left in so it doesn't break
            obj.shadowed = (obj.shadowed !== false);

            var $message = renderMessageElement(this.template, obj, type);
            insertMessageIntoContext($message, obj.insert, context);

            // Attach the optional extra behaviours
            if (obj.closeable) {
                makeCloseable($message);
            }
            if (obj.fadeout) {
                makeFadeout($message, obj.delay, obj.duration);
            }

            return $message;
        };
    }

    function makeCloseable(message) {
        $(message || 'div.aui-message.closeable').each(function () {
            var $this = $(this),
                $closeIcons = $this.find('.aui-icon.icon-close');
            var $icon = $closeIcons.length > 0 ? $closeIcons.first() : $('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
            $this.addClass('closeable');
            $this.append($icon);
            
            initCloseMessageBoxOnClickAndKeypress($this);
        });
    }

    function makeFadeout(message, delay, duration) {
        delay = (typeof delay !== 'undefined') ? delay : DEFAULT_FADEOUT_DELAY;
        duration = (typeof duration !== 'undefined') ? duration : DEFAULT_FADEOUT_DURATION;

        $(message || 'div.aui-message.fadeout').each(function () {
            var $this = $(this);

            //Store the component state to avoid collisions between animations
            var hasFocus = false;
            var isHover = false;

            //Small functions to keep the code easier to read and avoid code duplication
            function fadeOut(){
                //Algorithm:
                //1. Stop all running animations (first arg), including any fade animation and delay
                //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
                //   jump to opacity:0 or opacity:1
                //2. Wait <delay> ms before starting the fadeout
                //3. Start the fadeout with a duration of <duration> ms
                //4. Close the message at the end of the animation
                $this.stop(true,false).delay(delay).fadeOut(duration, function(){
                    $this.closeMessage();
                });
            }
            function resetFadeOut(){
                //Algorithm:
                //1. Stop all running animations (first arg), including any fade animation and delay
                //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
                //   jump to opacity:0 or opacity:1
                //2. Fast animation to opacity:1
                $this.stop(true,false).fadeTo(FADEOUT_RESTORE_DURATION, 1);
            }
            function shouldStartFadeOut(){
                return !hasFocus && !isHover;
            }

            //Attach handlers for user interactions (focus and hover)
            $this
                .focusin(function(){
                    hasFocus = true;
                    resetFadeOut();
                })
                .focusout(function(){
                    hasFocus = false;
                    if (shouldStartFadeOut()) {
                        fadeOut();
                    }
                })
                .hover(
                function(){  //should be called .hoverin(), but jQuery does not implement that method
                    isHover = true;
                    resetFadeOut();
                },
                function(){ //should be called .hoverout(), but jQuery does not implement that method
                    isHover = false;
                    if (shouldStartFadeOut()) {
                        fadeOut();
                    }
                }
            );

            //Initial animation
            fadeOut();
        });
    }

    /**
     * Utility methods to display different message types to the user.
     * Usage:
     * <pre>
     * AJS.messages.info("#container", {
     *   title: "Info",
     *   body: "You can choose to have messages without Close functionality.",
     *   closeable: false,
     *   shadowed: false
     * });
     * </pre>
     * @class messages
     * @namespace AJS
     * @requires AJS.keyCode
     */
    exports.messages = {
        setup: function () {
            createMessageConstructor('generic');
            createMessageConstructor('error');
            createMessageConstructor('warning');
            createMessageConstructor('info');
            createMessageConstructor('success');
            createMessageConstructor('hint');
        },
        makeCloseable: makeCloseable,
        makeFadeout: makeFadeout,
        template: MESSAGE_TEMPLATE,
        createMessage: createMessageConstructor
    };

    function initCloseMessageBoxOnClickAndKeypress($message) {
        $message.on('click', '.aui-icon.icon-close', function(e) {
            $(e.target).closest('.aui-message').closeMessage();
        }).on('keydown', '.aui-icon.icon-close', function (e) {
            if ((e.which === AJS.keyCode.ENTER) || (e.which === AJS.keyCode.SPACE)) {
                $(e.target).closest('.aui-message').closeMessage();
                e.preventDefault(); // this is especially important when handling the space bar, as we don't want to page down
            }
        });
    }

    function insertMessageIntoContext($message, insertWhere, context) {
        if (insertWhere === 'prepend') {
            $message.prependTo(context);
        } else {
            $message.appendTo(context);
        }
    }

    function renderMessageElement(template, options, type) {
        // Append the message using template
        var $message = $(AJS.template(template).fill({
            type: type,
            closeable: options.closeable ? 'closeable' : '',
            shadowed: options.shadowed ? 'shadowed' : '',
            fadeout: options.fadeout ? 'fadeout' : '',
            title: options.title || '',
            'body:html': options.body || ''
        }).toString());

        // Add ID if supplied
        if (options.id) {
            if (/[#\'\"\.\s]/g.test(options.id)) {
                // reject IDs that don't comply with style guide (ie. they'll break stuff)
                AJS.log('AJS.Messages error: ID rejected, must not include spaces, hashes, dots or quotes.');
            } else {
                $message.attr('id', options.id);
            }
        }

        return $message;
    }

    $.fn.closeMessage = function () {
        var $message = $(this);
        if ($message.hasClass('aui-message') && $message.hasClass('closeable')) {
            $message.stop(true); //Stop any running animation
            $message.trigger('messageClose', [this]).remove();  //messageClose event Deprecated as of 5.3
            $(document).trigger('aui-message-close', [this]);  //must trigger on document since the element has been removed
        }
    };

    $(function () {
        exports.messages.setup();
    });
    
    AJS.deprecate.prop(exports.messages, 'makeCloseable', {
        extraInfo: 'Use the "closeable" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
    });

    AJS.deprecate.prop(exports.messages, 'createMessage', {
        extraInfo: 'Use the provided convenience methods instead e.g. AJS.messages.generic(). Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
    });

    AJS.deprecate.prop(exports.messages, 'makeFadeout', {
        extraInfo: 'Use the "fadeout" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
    });

})(AJS, AJS.$);
