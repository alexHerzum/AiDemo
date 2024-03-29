(function ($) {
    var $document = $(document),

        //convenience function because this needs to be run for all the events.
        getExpanderProperties = function(event){
            var properties = {};

            properties.$trigger = $(event.currentTarget);
            properties.$content = $document.find('#' + properties.$trigger.attr('aria-controls'));
            properties.triggerIsParent = properties.$content.parent().filter(properties.$trigger).length !== 0;
            properties.$shortContent = properties.triggerIsParent ? properties.$trigger.find('.aui-expander-short-content') : null;
            properties.height = properties.$content.css('min-height');
            properties.isCollapsible = properties.$trigger.data('collapsible') !== false;
            properties.replaceText = properties.$trigger.attr('data-replace-text'); //can't use .data here because it doesn't update after the first call
            properties.replaceSelector = properties.$trigger.data('replace-selector');

            return properties;
        },
        replaceText = function(properties) {
            if (properties.replaceText) {
                var $replaceElement = properties.replaceSelector ?
                properties.$trigger.find(properties.replaceSelector) :
                    properties.$trigger;

                properties.$trigger.attr('data-replace-text', $replaceElement.text());
                $replaceElement.text(properties.replaceText);
            }
        };
        //events that the expander listens to
        var EXPANDER_EVENTS = {
            'aui-expander-invoke': function(event) {
                var $trigger = $(event.currentTarget);
                var $content = $document.find('#' + $trigger.attr('aria-controls'));
                var isCollapsible = $trigger.data('collapsible') !== false;

                //determine if content should be expanded or collapsed
                if ($content.attr('aria-expanded') === 'true' && isCollapsible) {
                    $trigger.trigger('aui-expander-collapse');
                } else {
                    $trigger.trigger('aui-expander-expand');
                }
            },
            'aui-expander-expand': function(event) {
                var properties = getExpanderProperties(event);

                properties.$content.attr('aria-expanded', 'true');
                properties.$trigger.attr('aria-expanded', 'true');

                if (properties.$content.outerHeight() > 0) {
                    properties.$content.attr('aria-hidden', 'false');
                }

                //handle replace text
                replaceText(properties);

                //if the trigger is the parent also hide the short-content (default)
                if(properties.triggerIsParent){
                    properties.$shortContent.hide();
                }
                properties.$trigger.trigger('aui-expander-expanded');

            },
            'aui-expander-collapse': function(event){

                var properties = getExpanderProperties(event);

                //handle replace text
                replaceText(properties);

                //collapse the expander
                properties.$content.attr('aria-expanded', 'false');
                properties.$trigger.attr('aria-expanded', 'false');

                //if the trigger is the parent also hide the short-content (default)
                if(properties.triggerIsParent){
                    properties.$shortContent.show();
                }

                //handle the height option
                if (properties.$content.outerHeight() === 0) {
                    properties.$content.attr('aria-hidden', 'true');
                }

                properties.$trigger.trigger('aui-expander-collapsed');
            },

            'click.aui-expander': function(event){
                var $target = $(event.currentTarget);
                $target.trigger('aui-expander-invoke', event.currentTarget);
            }
        };

    //delegate events to the triggers on the page
    $document.on(EXPANDER_EVENTS, '.aui-expander-trigger');

})(jQuery);
