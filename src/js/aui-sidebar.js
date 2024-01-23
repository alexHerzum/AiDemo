(function ($) {

    'use strict';

    var SUPPORTS_TRANSITIONS = (typeof document.documentElement.style['transition'] !== "undefined") ||
            (typeof document.documentElement.style['webkitTransition'] !== "undefined");

    function sidebarOffset (sidebar) {
        return sidebar.offset().top;
    }

    function Sidebar (selector) {
        this.$body = $('body');
        this.$el = $(selector);
        this.$wrapper = this.$el.children('.aui-sidebar-wrapper');

        this.submenus = new SubmenuManager();

        // Sidebar users should add class="aui-page-sidebar" to the
        // <body> in the rendered markup (to prevent any potential flicker),
        // so we add it just in case they forgot.
        this.$body.addClass('aui-page-sidebar');

        this._previousScrollTop = null;
        this._previousViewportHeight = null;
        this._previousViewportWidth = null;
        this._previousOffsetTop = null;
    }

    var FORCE_COLLAPSE_WIDTH = 1240;
    var EVENT_PREFIX = '_aui-internal-sidebar-';

    Sidebar.prototype.on = function () {
        var events = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        var namespacedEvents = $.map(events.split(' '), function (event) {
            return EVENT_PREFIX + event;
        }).join(' ');
        this.$el.on.apply(this.$el, [namespacedEvents].concat(args));
        return this;
    };

    Sidebar.prototype.setHeight = function (scrollTop, viewportHeight, headerHeight) {
        scrollTop = scrollTop || window.pageYOffset;
        viewportHeight = viewportHeight || document.documentElement.clientHeight;
        headerHeight = headerHeight || sidebarOffset(this.$el);
        var visibleHeaderHeight = Math.max(0, headerHeight - scrollTop);
        this.$wrapper.height(viewportHeight - visibleHeaderHeight);
        return this;
    };

    Sidebar.prototype.setPosition = function (scrollTop) {
        scrollTop = scrollTop || window.pageYOffset;
        this.$wrapper.toggleClass('aui-is-docked', scrollTop > sidebarOffset(this.$el));
        return this;
    };

    Sidebar.prototype.setCollapsedState = function (viewportWidth) {
        // Reflow behaviour is implemented as a state machine (hence all
        // state transitions are enumerated). The rest of the state machine,
        // e.g., entering the expanded narrow (fly-out) state, is implemented
        // by the toggle() method.
        var transition = {collapsed: {}, expanded: {}};
        transition.collapsed.narrow = {
            narrow: $.noop,
            wide: function (s) { s._expand(viewportWidth); }
        };
        transition.collapsed.wide = {
            narrow: $.noop,  // Becomes collapsed narrow (no visual change).
            wide: $.noop
        };
        transition.expanded.narrow = {
            narrow: $.noop,
            wide: function (s) {
                s.$body.removeClass('aui-sidebar-collapsed');
                s.$el.removeClass('aui-sidebar-fly-out');
            }
        };
        transition.expanded.wide = {
            narrow: function (s) { s.collapse(); },
            wide: $.noop
        };

        var collapseState = this.isCollapsed() ? 'collapsed' : 'expanded';
        var oldSize = this.isViewportNarrow(this._previousViewportWidth) ? 'narrow' : 'wide';
        var newSize = this.isViewportNarrow(viewportWidth) ? 'narrow' : 'wide';
        transition[collapseState][oldSize][newSize](this);
        return this;
    };

    Sidebar.prototype.collapse = function () {
        this.$el.trigger($.Event(EVENT_PREFIX + 'collapse-start'));

        this.$body.addClass('aui-sidebar-collapsed');
        this.$el.attr('aria-expanded', 'false');
        this.$el.removeClass('aui-sidebar-fly-out');

        if (!this.isAnimated()) {
            this.$el.trigger($.Event(EVENT_PREFIX + 'collapse-end'));
        }
        return this;
    };

    Sidebar.prototype._expand = function (viewportWidth) {
        this.$el.trigger($.Event(EVENT_PREFIX + 'expand-start'));

        var isViewportNarrow = this.isViewportNarrow(viewportWidth);
        this.$el.attr('aria-expanded', 'true');
        this.$body.toggleClass('aui-sidebar-collapsed', isViewportNarrow);
        this.$el.toggleClass('aui-sidebar-fly-out', isViewportNarrow);

        if (!this.isAnimated()) {
            this.$el.trigger($.Event(EVENT_PREFIX + 'expand-end'));
        }
        return this;
    };

    Sidebar.prototype.expand = function () {
        this._expand(this._previousViewportWidth);
        return this;
    };

    Sidebar.prototype.isAnimated = function () {
        return SUPPORTS_TRANSITIONS && this.$el.hasClass('aui-is-animated');
    };

    Sidebar.prototype.isCollapsed = function () {
        return this.$el.attr('aria-expanded') === 'false';
    };

    Sidebar.prototype.isViewportNarrow = function (viewportWidth) {
        viewportWidth = viewportWidth === undefined ? this._previousViewportWidth : viewportWidth;
        return viewportWidth < FORCE_COLLAPSE_WIDTH;
    };

    Sidebar.prototype.reflow = function () {
        var scrollTop = window.pageYOffset;
        var viewportHeight = document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth;

        // Header height needs to be checked because in Stash it changes when the CSS "transform: translate3d" is changed.
        // If you called reflow() after this change then nothing happened because the scrollTop and viewportHeight hadn't changed.
        var offsetTop = sidebarOffset(this.$el);

        if (!(scrollTop === this._previousScrollTop && viewportHeight === this._previousViewportHeight && offsetTop === this._previousOffsetTop)) {
          if (!this.$body.hasClass('aui-page-sidebar-touch')) {
            this.setHeight(scrollTop, viewportHeight, offsetTop);
            this.setPosition(scrollTop);
          }
        }

        var isResponsive = this.$el.attr('data-aui-responsive') !== 'false';
        if (isResponsive) {
            var isInitialPageLoad = this._previousViewportWidth === null;
            if (isInitialPageLoad) {
                if (!this.isCollapsed() && this.isViewportNarrow(viewportWidth)) {
                    var isAnimated = this.isAnimated();
                    if (isAnimated) {
                        this.$el.removeClass('aui-is-animated');
                    }
                    // This will trigger the "collapse" event before non-sidebar
                    // JS code has a chance to bind listeners; they'll need to
                    // check isCollapsed() if they care about the value at that
                    // time.
                    this.collapse();
                    if (isAnimated) {
                        // We must trigger a CSS reflow (by accessing
                        // offsetHeight) otherwise the transition still runs.
                        // jshint expr:true
                        this.$el[0].offsetHeight;
                        this.$el.addClass('aui-is-animated');
                    }
                }
            } else if (viewportWidth !== this._previousViewportWidth) {
                this.setCollapsedState(viewportWidth);
            }
        } else {
            var isFlyOut = !this.isCollapsed() && this.isViewportNarrow(viewportWidth);
            this.$el.toggleClass('aui-sidebar-fly-out', isFlyOut);
        }

        this._previousScrollTop = scrollTop;
        this._previousViewportHeight = viewportHeight;
        this._previousViewportWidth = viewportWidth;
        this._previousOffsetTop = offsetTop;
        return this;
    };

    Sidebar.prototype.toggle = function () {
        if (this.isCollapsed()) {
            if (this.submenus.isShowing()) {
                this.submenus.hide(this.expand.bind(this));
            } else {
                this.expand();
                // tooltips are orphaned when sidebar is expanded, so if there are any visible on the page we remove them all.
                // Can't scope it to the Sidebar (this) because the tooltip div is a direct child of <body>
                $('.aui-sidebar-section-tooltip').remove();
            }
        } else {
            this.collapse();
        }
        return this;
    };

    /**
     * Returns a jQuery selector string for the trigger elements when the
     * sidebar is in a collapsed state, useful for delegated event binding.
     *
     * When using this selector in event handlers, the element ("this") will
     * either be an <a> (when the trigger was a tier-one menu item) or an
     * element with class "aui-sidebar-group" (for non-tier-one items).
     *
     * For delegated event binding you should bind to $el and check the value
     * of isCollapsed(), e.g.,
     *
     *     sidebar.$el.on('click', sidebar.collapsedTriggersSelector, function (e) {
     *         if (!sidebar.isCollapsed()) {
     *             return;
     *         }
     *     });
     *
     * @returns string
     */
    Sidebar.prototype.collapsedTriggersSelector = [
        '.aui-sidebar-group:not(.aui-sidebar-group-tier-one)',
        '.aui-sidebar-group.aui-sidebar-group-tier-one > .aui-nav > li > a',
        '.aui-sidebar-footer > .aui-sidebar-settings-button'
    ].join(', ');

    Sidebar.prototype.toggleSelector = '.aui-sidebar-footer > .aui-sidebar-toggle';

    function SubmenuManager() {
        this.inlineDialog = AJS.InlineDialog($(), 'sidebar-submenu', this.inlineDialogShowHandler.bind(this), {
            noBind: true,
            addActiveClass: false,
            hideCallback: this.inlineDialogHideHandler.bind(this),
            gravity: 'w',
            hideDelay: 300,
            offsetY: function (popup, targetPosition) {
                var halfTriggerHeight = targetPosition.target.height() / 2;
                var halfPopupHeight = popup.height() / 2;
                return halfPopupHeight - halfTriggerHeight - this.submenuHeadingHeight();
            }.bind(this),
            arrowOffsetY: function (popup, targetPosition) {
                var halfTriggerHeight = targetPosition.target.height() / 2;
                var halfPopupHeight = popup.height() / 2;
                return -halfPopupHeight + this.submenuHeadingHeight() + halfTriggerHeight;
            }.bind(this)
        });

        this.$trigger = null;
        this.$placeholder = null;
        this.$placeholderSubmenu = null;
        this.postHideCallback = null;
    }

    SubmenuManager.prototype.submenu = function ($trigger) {
        return $trigger.is('a') ? $trigger.next('.aui-nav') : $trigger.children('.aui-nav');
    };

    SubmenuManager.prototype.hasSubmenu = function ($trigger) {
        return this.submenu($trigger).length !== 0;
    };

    SubmenuManager.prototype.submenuHeadingHeight = function () {
        // At the time we want to measure the submenu heading (inside the
        // offsetY and arrowOffsetY functions), the submenu heading is not
        // visible in the page (since the sidebar is collapsed), so we don't
        // have a reliable way of measuring its height.
        return 34;
    };

    SubmenuManager.prototype.isShowing = function () {
        return this.$trigger !== null;
    };

    SubmenuManager.prototype.show = function (e, triggerEl) {
        var wasShowing = this.isShowing();
        this.inlineDialog.show(e, triggerEl);
        if (wasShowing) {
            // Redraw the inline dialog in its new position.
            this.inlineDialog.refresh();
        }
        return this;
    };

    SubmenuManager.prototype.hide = function (callback) {
        if (callback !== undefined) {
            this.postHideCallback = callback;
        }
        this.inlineDialog.hide();
        return this;
    };

    // We use a string (INLINE_DIALOG_HTML) rather than soy since AUI
    // components don't depend on AUI templates (for now).
    var INLINE_DIALOG_HTML =
        '<div class="aui-sidebar-submenu">' +
            '<div class="aui-navgroup aui-navgroup-vertical">' +
                '<div class="aui-navgroup-inner">' +
                    '<div class="aui-nav-heading"><strong></strong></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    SubmenuManager.prototype.inlineDialogShowHandler = function ($content, triggerEl, showPopup) {
        if (this.isShowing()) {
            // If the inline dialog is showing we can't simply call
            // this.inlineDialog.hide() since its implementation queues the
            // hiding, i.e., uses setTimeout(0); we update the contents
            // instead.
            this.restoreSubmenu();
            this.$trigger.removeClass('active');
        }

        this.$trigger = $(triggerEl).is('.aui-sidebar-group') ? $(triggerEl) : $(triggerEl).closest('a');
        this.$trigger.addClass('active');

        // TODO The title here should use the same code as what we display
        //      in the tipsy tooltips for the triggers.
        var title = this.$trigger.is('a') ? this.$trigger.text() : this.$trigger.children('.aui-nav-heading').text();
        $content.html(INLINE_DIALOG_HTML);

        var $container = $content.find('.aui-navgroup-inner');
        $container.children('.aui-nav-heading')
            .attr('title', title)
            .children('strong')
                .text(title);

        this.moveSubmenuToInlineDialog(this.submenu(this.$trigger));
        showPopup();
    };

    SubmenuManager.prototype.inlineDialogHideHandler = function () {
        this.restoreSubmenu();
        this.$trigger.removeClass('active');
        this.$trigger = null;

        if (this.postHideCallback !== null) {
            this.postHideCallback();
            this.postHideCallback = null;
        }
    };

    SubmenuManager.prototype.moveSubmenuToInlineDialog = function ($submenu) {
        this.$placeholder = $('<!-- placholder -->');
        this.$placeholderSubmenu = $submenu;
        $submenu.replaceWith(this.$placeholder);
        this.inlineDialog.find('.aui-navgroup-inner').append($submenu);
        return this;
    };

    SubmenuManager.prototype.restoreSubmenu = function () {
        this.$placeholder.replaceWith(this.$placeholderSubmenu);
        delete this.$placeholder;
        delete this.$placeholderSubmenu;
        return this;
    };

    var tipsyOpts = {
        trigger: 'manual',
        gravity: 'w',
        className: 'aui-sidebar-section-tooltip',
        title: function () {
            var $item = $(this);
            if ($item.is('a')) {
                return $item.attr('title') || $item.find('.aui-nav-item-label').text() || $item.data('tooltip');
            } else {
                return $item.children('.aui-nav').attr('title') || $item.children('.aui-nav-heading').text();
            }
        }
    };

    function showTipsy($trigger) {
        $trigger.tipsy(tipsyOpts).tipsy('show');
        var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
        if ($tip) { // if .aui-sidebar-group does not have a title to display
            // Remove "opacity" inline style from Tipsy to allow the our own styles and transitions to be applied
            $tip.css({'opacity': ''}).addClass('tooltip-shown');
        }
    }

    function hideTipsy($trigger) {
        var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
        if ($tip) {
            $tip.on('transitionend', function() {
                $trigger.tipsy('hide');
            });
            $tip.removeClass('tooltip-shown');
        }
    }

    AJS.sidebar = AJS._internal.widget('sidebar', Sidebar);


    $(function ($) {
        var $sidebar = $('.aui-sidebar');
        if (!$sidebar.length) {
            return;
        }

        if (Modernizr.touch) {
            $('body').addClass('aui-page-sidebar-touch');
        }

        var sidebar = new Sidebar($sidebar);

        var pendingReflow = null;
        $(window).on('scroll resize', function () {
            if (pendingReflow === null) {
                pendingReflow = requestAnimationFrame(function () {
                    sidebar.reflow();
                    pendingReflow = null;
                });
            }
        });
        sidebar.reflow();

        if (sidebar.isAnimated()) {
            sidebar.$el.on('transitionend webkitTransitionEnd', function () {
                sidebar.$el.trigger($.Event(EVENT_PREFIX + (sidebar.isCollapsed() ? 'collapse-end' : 'expand-end')));
            });
        }

        sidebar.$el.on('click', '.aui-sidebar-toggle', function (e) {
            e.preventDefault();
            sidebar.toggle();
        });

        sidebar.$el.on('click', '.aui-sidebar-body', function (e) {
            if($(e.target).is('.aui-sidebar-body')) {
                e.preventDefault();
                sidebar.toggle();
            }
        });

        $('.aui-page-panel').click(function (e) {
            if (!sidebar.isCollapsed() && sidebar.isViewportNarrow()) {
                sidebar.collapse();
            }
        });

        AJS.whenIType('[').execute(function () {
            sidebar.toggle();
        });

        sidebar.$el.on('touchend', function (e) {
            if (sidebar.isCollapsed()) {
                sidebar.expand();
                e.preventDefault();
            }
        });

        sidebar.$el.on('mouseenter focus', sidebar.collapsedTriggersSelector, function (e) {
            if (!sidebar.isCollapsed()) {
                return;
            }

            var $trigger = $(this);

            if (sidebar.submenus.hasSubmenu($trigger)) {
                e.preventDefault();
                sidebar.submenus.show(e, this);
            } else if ($trigger.hasClass('active') && sidebar.submenus.isShowing()) {
                // prevent triggering the same submenu again and hiding it
                e.stopImmediatePropagation();
            } else {
                sidebar.submenus.hide();
                showTipsy($trigger);
            }
        });

        sidebar.$el.on('click blur mouseleave', sidebar.collapsedTriggersSelector, function (e) {
            if (!sidebar.isCollapsed()) {
                return;
            }
            hideTipsy($(this));
        });

        sidebar.$el.on('click', sidebar.collapsedTriggersSelector, function(e) {
            if (sidebar.submenus.isShowing()) {
                // prevent hiding of the submenu if someone clicks on it, since it's already shown on hover
                e.stopImmediatePropagation();
            }
        });

        sidebar.$el.on('mouseenter focus', sidebar.toggleSelector, function () {
            var $trigger = $(this);
            if(sidebar.isCollapsed()) {
                $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.expand.tooltip'));
            } else {
                $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.collapse.tooltip'));
            }
            showTipsy($trigger);
        });

        sidebar.$el.on('click blur mouseleave', sidebar.toggleSelector, function () {
            hideTipsy($(this));
        });

        sidebar.$el.find('.aui-sidebar-body').on('mouseenter mouseover mouseleave',function(e) {
            sidebar.$el.toggleClass('aui-is-hover',
                (e.type === 'mouseover' || e.type === 'mouseenter')
                && !$(e.target).parentsUntil(sidebar.$el).filter('.aui-page-header, .aui-navgroup').length);

            // workaround for https://ecosystem.atlassian.net/browse/AUI-2555
            // we manually hide the submenus when the mouse leaves the trigger and into the sidebar body
            if (e.type === 'mouseover' && !$(e.target).closest('a').hasClass('active')) {
                sidebar.submenus.hide();
            }
        })

    });

}(AJS.$));
