;(function(init) {
    'use strict';

    define(function() {
        return init(AJS, AJS.$, AJS.template);
    });
})(function (AJS, $, template) {
    'use strict';

    var ID_FLAG_CONTAINER = 'aui-flag-container';

    function flag (options) {
        var isMessageCloseable = !options.persistent;
        var $flag = renderFlagElement(options);

        if (isMessageCloseable) {
            makeCloseable($flag);
        }

        pruneFlagContainer();
        insertFlag($flag);
    }

    function renderFlagElement(options) {
        var html =
            '<div class="aui-flag">' +
                '<div class="aui-message aui-message-{type} {type} {persistent} shadowed">' +
                    '<p class="title">' +
                    '<strong>{title}</strong>' +
                    '</p>' +
                    '{body}<!-- .aui-message -->' +
                '</div>' +
            '</div>';

        var $flag = $(template(html).fill({
            type: options.type || 'info',
            persistent: options.persistent ? '' : 'closeable',
            title: options.title || '',
            'body:html': options.body || ''
        }).toString());

        return $flag;
    }

    function makeCloseable($flag) {
        var $icon = $('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
        $icon.click(function () {
            closeFlag($flag);
        });
        $icon.keypress(function(e) {
            if ((e.which === AJS.keyCode.ENTER) || (e.which === AJS.keyCode.SPACE)) {
                closeFlag($flag);
                e.preventDefault();
            }
        });

        $flag.find('.aui-message').append($icon);
    }

    function closeFlag($flagToClose) {
        $flagToClose.attr('aria-hidden', 'true');
    }

    function pruneFlagContainer() {
        var $container = findContainer();
        var $allFlags = $container.find('.aui-flag');

        $allFlags.get().forEach(function(flag) {
            var isFlagAriaHidden = flag.getAttribute('aria-hidden') === 'true';
            if (isFlagAriaHidden) {
                $(flag).remove();
            }
        });
    }

    function findContainer() {
        return $('#' + ID_FLAG_CONTAINER);
    }

    function insertFlag($flag) {
        var $flagContainer = findContainer();
        if (!$flagContainer.length) {
            $flagContainer = $('<div id="' + ID_FLAG_CONTAINER + '"></div>');
            $('body').prepend($flagContainer);
        }

        $flag.appendTo($flagContainer);
        AJS._internal.animation.recomputeStyle($flag);
        $flag.attr('aria-hidden', 'false');
    }

    return flag;
});
