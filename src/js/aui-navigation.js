;(function(init) {
    'use strict';

    AJS.navigation = init(AJS.$, window.skate, AJS._internal.widget);
})(function ($, skate, widget) {

    'use strict';

    /**
     * Navigation (".aui-nav" elements).
     *
     * @param {(string|HtmlElement|jQuery)} selector - An expression
     *     representing a single .aui-nav element; you may also pass an expression
     *     for a descendent element, in which case the closest containing
     *     .aui-nav element is used.
     * @constructor
     */
    function Navigation (selector) {
        this.$el = $(selector).closest('.aui-nav');

        // If there are multiple objects, initialise them separately
        if (this.$el.length > 1) {
            return this.$el.map(function(idx, elm) {
                return new Navigation(elm);
            })[0];
        }

        // If already initialised, return existing object
        if (this.$el.data('aui-navigation')) {
            return this.$el.data('aui-navigation');
        }

        this.$el.data('aui-navigation', this);

        this.$treeParent = this.$el.parent('li[aria-expanded]');
        this.$subtreeToggleIcon = this.$treeParent
            .children('.aui-nav-subtree-toggle')
            .children('span.aui-icon');

        // Hide extra items under a 'More...' link
        this.hideMoreItems();

        // Add child-selected class to relevant attributes
        this.$el.children('li:has(.aui-nav-selected)').addClass('aui-nav-child-selected');

        // Auto-expand if child is selected
        var $selected = this.$el.children('.aui-nav-selected');
        $selected
            .parents('.aui-nav > [aria-expanded=false]')
            .add($selected.filter('[aria-expanded=false]'))
            .each(function() {
                var nav = navigationWidget($(this).children('.aui-nav'));
                nav.expand();
            });

        // Toggle expand on click
        this.$el.find('> li[aria-expanded] > .aui-nav-subtree-toggle').on('click', function () {
            var nav = navigationWidget($(this).siblings('.aui-nav'));
            nav.toggle();
        });

        return this;
    }

    Navigation.prototype.isNested = function () {
        return this.$treeParent.length === 1;
    };

    Navigation.prototype.isCollapsed = function () {
        return this.$treeParent.attr('aria-expanded') === 'false';
    };

    Navigation.prototype.expand = function () {
        this.$treeParent.attr('aria-expanded', 'true');
        this.$subtreeToggleIcon
            .removeClass('aui-iconfont-collapsed')
            .addClass('aui-iconfont-expanded');
        this.hideMoreItems();
        return this;
    };

    Navigation.prototype.collapse = function () {
        this.$treeParent.attr('aria-expanded', 'false');
        this.$subtreeToggleIcon
            .removeClass('aui-iconfont-expanded')
            .addClass('aui-iconfont-collapsed');
        return this;
    };

    Navigation.prototype.toggle = function () {
        if (this.isCollapsed()) {
            this.expand();
        } else {
            this.collapse();
        }
        return this;
    };

    Navigation.prototype.hideMoreItems = function() {
        if (this.$el.is('.aui-nav:not([aria-expanded=false]) [data-more]')) {
            var moreText = this.$el.attr('data-more') || AJS.I18n.getText('aui.words.moreitem');
            var limit = Math.abs(parseInt(this.$el.attr('data-more-limit'))) || 5;
            var $listElements = this.$el.children('li');

            // Only add 'More...' if there is more than one element to hide and there are no selected elements
            var lessThanTwoToHide = $listElements.length <= limit + 1;
            var selectedElementPresent = $listElements.filter('.aui-nav-selected').length;
            var alreadyInitialised = $listElements.filter('.aui-nav-more').length;
            if (lessThanTwoToHide || selectedElementPresent || alreadyInitialised) {
                return this;
            }

            $('<li>', {
                'class': 'aui-nav-more',
                'aria-hidden': 'true'
            }).append($('<a>', {
                'href': '#',
                'class': 'aui-nav-item',
                'text': moreText,
                'click': function(e) {
                    e.preventDefault();
                    $(this).parent().remove();
                }
            })).insertAfter($listElements.eq(limit - 1));
        }

        return this;
    };


    var navigationWidget = widget('navigation', Navigation);

    // Initialise nav elements
    skate('aui-nav', {
        ready: function(element) {
            navigationWidget(element);
        }
    });


    return navigationWidget;

});
