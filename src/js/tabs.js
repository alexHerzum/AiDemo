(function ($){

    'use strict';

    var REGEX = /#.*/;
    var ACTIVE_TAB = "active-tab";
    var ACTIVE_PANE = "active-pane";
    var ARIA_SELECTED = "aria-selected";
    var ARIA_HIDDEN = "aria-hidden";
    var DATA_TABS_PERSIST = "data-aui-persist";
    var STORAGE_PREFIX = "_internal-aui-tabs-";
    var RESPONSIVE_OPT_IN_SELECTOR = ".aui-tabs.horizontal-tabs[data-aui-responsive]:not([data-aui-responsive='false'])";

    function enhanceTabLink() {
        var $thisLink = $(this);
        AJS._addID($thisLink); // ensure there's an id for later
        $thisLink.attr('role', 'tab');
        var targetPane = $thisLink.attr('href'); // remember href includes # for selector
        $(targetPane).attr('aria-labelledby', $thisLink.attr('id'));

        if ($thisLink.parent().hasClass(ACTIVE_TAB)) {
            $thisLink.attr(ARIA_SELECTED, 'true');
        } else {
            $thisLink.attr(ARIA_SELECTED, 'false');
        }
    }

    var ResponsiveAdapter = {

        totalTabsWidth: function($visibleTabs, $dropdown) {
            var totalVisibleTabsWidth = this.totalVisibleTabWidth($visibleTabs);
            var totalDropdownTabsWidth = 0;
            $dropdown.find('li').each(function(index, tab){
                totalDropdownTabsWidth += parseInt(tab.getAttribute('data-aui-tab-width'));
            });

            return totalVisibleTabsWidth + totalDropdownTabsWidth;
        },

        totalVisibleTabWidth: function($tabs) {
            var totalWidth = 0;
            $tabs.each(function(index, tab) {
                totalWidth += $(tab).outerWidth();
            });
            return totalWidth;
        },

        removeResponsiveDropdown: function($dropdown, $dropdownTriggerTab) {
            $dropdown.remove();
            $dropdownTriggerTab.remove();
        },

        createResponsiveDropdownTrigger: function($tabsMenu, id) {
            var triggerMarkup = '<li class="menu-item aui-tabs-responsive-trigger-item">' +
                '<a class="aui-dropdown2-trigger aui-tabs-responsive-trigger aui-dropdown2-trigger-arrowless" id="aui-tabs-responsive-trigger-' + id + '" aria-haspopup="true" aria-owns="aui-tabs-responsive-dropdown-' + id + '" href="aui-tabs-responsive-dropdown-' + id + '">...</a>' +
                '</li>';
            $tabsMenu.append(triggerMarkup);
            var $trigger = $tabsMenu.find('.aui-tabs-responsive-trigger-item');
            return $trigger;
        },

        createResponsiveDropdown: function($tabsContainer, id) {
            var dropdownMarkup = '<div class="aui-dropdown2 aui-style-default aui-tabs-responsive-dropdown" id="aui-tabs-responsive-dropdown-' + id +'">' +
                '<ul>' +
                '</ul>' +
                '</div>'
            $tabsContainer.append(dropdownMarkup);
            var $dropdown = $tabsContainer.find('#aui-tabs-responsive-dropdown-' + id);
            return $dropdown;
        },

        findNewVisibleTabs: function(tabs, parentWidth, dropdownTriggerTabWidth) {
            function hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) {
                return currentTotalTabWidth + dropdownTriggerTabWidth <= parentWidth;
            }

            var currentTotalTabWidth = 0;
            for(var i = 0; hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) && i < tabs.length; i++) {
                var $tab = $(tabs[i]);
                var tabWidth = $tab.outerWidth(true);
                currentTotalTabWidth += tabWidth;
            }
            //i should now be at the tab index after the last visible tab because of the loop so we minus 1 to get the new visible tabs
            return tabs.slice(0, i - 1);
        },

        processVisibleTabs: function(oldVisibleTabs, $tabsParent, $dropdownTriggerTab) {
            var dropdownId = $dropdownTriggerTab.find('a').attr('aria-owns');
            var $dropdown = $('#' + dropdownId);
            var newVisibleTabs = this.findNewVisibleTabs(oldVisibleTabs, $tabsParent.outerWidth(), $dropdownTriggerTab.parent().outerWidth(true));
            var lastTabIndex = newVisibleTabs.length - 1;

            for(var j = oldVisibleTabs.length - 1; j >= lastTabIndex;  j--) {
                var $tab = $(oldVisibleTabs[j]);
                this.moveTabToResponsiveDropdown($tab, $dropdown, $dropdownTriggerTab);
            }

            return $(newVisibleTabs);
        },

        moveTabToResponsiveDropdown: function($tab, $dropdown, $dropdownTriggerTab) {
            var $tabLink = $tab.find('a');
            $tab.attr('data-aui-tab-width', $tab.outerWidth(true));
            $tabLink.addClass('aui-dropdown2-radio aui-tabs-responsive-item');
            if($tab.hasClass('active-tab')) {
                $tabLink.addClass('aui-dropdown2-checked');
                $dropdownTriggerTab.addClass('active-tab');
            }
            $dropdown.find('ul').prepend($tab);
        },

        processInvisibleTabs: function(tabsInDropdown, remainingSpace, $dropdownTriggerTab) {

            for(var i = 0; hasMoreSpace(remainingSpace) && i < tabsInDropdown.length; i++) {
                var $tab = $(tabsInDropdown[i]);
                var tabInDropdownWidth = parseInt($tab.attr('data-aui-tab-width'), 10);
                var shouldMoveTabOut = tabInDropdownWidth < remainingSpace;

                if(shouldMoveTabOut) {
                    this.moveTabOutOfDropdown($tab, $dropdownTriggerTab);
                }

                remainingSpace -= tabInDropdownWidth;
            }

            function hasMoreSpace(remainingSpace) {
                return remainingSpace > 0;
            }

        },
        moveTabOutOfDropdown: function($tab, $dropdownTriggerTab) {
            var isTabInDropdownActive = $tab.find('a').hasClass('aui-dropdown2-checked');
            if(isTabInDropdownActive){
                $tab.addClass('active-tab');
                $dropdownTriggerTab.removeClass('active-tab');
            };
            $tab.children('a').removeClass('aui-dropdown2-radio aui-tabs-responsive-item aui-dropdown2-checked');

            $dropdownTriggerTab.before($tab);
        }
    }


    function calculateResponsiveTabs(tabsContainer, index) {
        //this function is run by jquery .each() where 'this' is the current tabs container
        var $tabsContainer = $(tabsContainer);
        var $tabsParent = $tabsContainer.parent();
        var $tabsMenu = $tabsContainer.find('.tabs-menu').first();
        var $visibleTabs = $tabsMenu.find('li:not(.aui-tabs-responsive-trigger-item)');
        var $dropdownTriggerTab = $tabsMenu.find('.aui-tabs-responsive-trigger').parent();
        var $dropdownTrigger = $dropdownTriggerTab.find('a');
        var dropdownId =  $dropdownTrigger.attr('aria-owns');
        var $dropdown = $(document).find('#' + dropdownId).attr('aria-checked', false)

        var isResponsive = $dropdown.length > 0;
        var totalTabsWidth = ResponsiveAdapter.totalTabsWidth($visibleTabs, $dropdown);
        var needsResponsive = totalTabsWidth > $tabsParent.outerWidth();

        if(!isResponsive && needsResponsive) {
            $dropdownTriggerTab = ResponsiveAdapter.createResponsiveDropdownTrigger($tabsMenu, index);
            $dropdown = ResponsiveAdapter.createResponsiveDropdown($tabsContainer, index);
        }

        //reset id's in case tabs have changed DOM order
        $dropdownTrigger.attr('aria-owns', 'aui-tabs-responsive-dropdown-' + index);
        $dropdownTrigger.attr('id', 'aui-tabs-responsive-trigger-' + index);
        $dropdownTrigger.attr('href', 'aui-tabs-responsive-trigger-' + index);
        $dropdown.attr('id', 'aui-tabs-responsive-dropdown-' + index);

        if(needsResponsive) {
            var $newVisibleTabs = ResponsiveAdapter.processVisibleTabs($visibleTabs.toArray(), $tabsParent, $dropdownTriggerTab);
            var visibleTabWidth = ResponsiveAdapter.totalVisibleTabWidth($newVisibleTabs);
            var remainingSpace = $tabsParent.outerWidth() - visibleTabWidth  - $dropdownTriggerTab.outerWidth(true);
            var hasSpace = remainingSpace > 0;
            if(hasSpace) {
                var $tabsInDropdown = $dropdown.find('li');
                ResponsiveAdapter.processInvisibleTabs($tabsInDropdown.toArray(), remainingSpace, $dropdownTriggerTab);
            }
            $dropdown.on("click", "a", handleTabClick);
        }

        if(isResponsive && !needsResponsive) {
            $dropdown.find('li').each(function(){
                ResponsiveAdapter.moveTabOutOfDropdown($(this), $dropdownTriggerTab);
            });
            ResponsiveAdapter.removeResponsiveDropdown($dropdown, $dropdownTriggerTab);
        }
    }

    function switchToTab($tab) {
        //only switch panes if the click target wasn't the responsive trigger
        if(!$tab.hasClass('aui-tabs-responsive-trigger')) {
            var $pane = $($tab.attr("href").match(REGEX)[0]);
            $pane.addClass(ACTIVE_PANE).attr(ARIA_HIDDEN,"false")
                .siblings(".tabs-pane").removeClass(ACTIVE_PANE).attr(ARIA_HIDDEN,"true");
            //only clear the dropdown checked states if click was outside the dropdown
            var $dropdownTriggerTab = $tab.parents('.aui-tabs').find('.aui-tabs-responsive-trigger-item a');
            var dropdownId = $dropdownTriggerTab.attr('aria-owns');
            var $dropdown = $(document).find('#' + dropdownId);
            $dropdown.find('li a').attr('aria-checked', false).removeClass('checked aui-dropdown2-checked');
            $dropdown.find('li').removeClass('active-tab');
        }
        $tab.parent("li.menu-item").addClass(ACTIVE_TAB)
            .siblings(".menu-item").removeClass(ACTIVE_TAB);
        if($tab.hasClass('aui-tabs-responsive-item')) {
            var $visibleTabs = $pane.parent('.aui-tabs').find('li.menu-item:not(.aui-tabs-responsive-trigger-item)');
            $visibleTabs.removeClass(ACTIVE_TAB);
            $visibleTabs.find('a').removeClass("checked").removeAttr("aria-checked");
        }

        $tab.closest(".tabs-menu").find("a").attr(ARIA_SELECTED,"false");
        $tab.attr(ARIA_SELECTED,"true");
        $tab.trigger("tabSelect", {
            tab: $tab,
            pane: $pane
        });
    }

    function isPersistentTabGroup($tabGroup) {
        // Tab group persistent attribute exists and is not false
        return $tabGroup.attr(DATA_TABS_PERSIST) !== undefined && $tabGroup.attr(DATA_TABS_PERSIST) !== "false";
    }

    function createPersistentKey($tabGroup) {
        var tabGroupId = $tabGroup.attr("id");
        var value = $tabGroup.attr(DATA_TABS_PERSIST);

        return STORAGE_PREFIX + (tabGroupId ? tabGroupId : "") + (value && value !== "true" ? "-" + value : "");
    }

    function updateTabsFromLocalStorage($tabGroups) {
        for (var i=0, ii = $tabGroups.length; i < ii; i++) {
            var $tabGroup = $tabGroups.eq(i);
            if (isPersistentTabGroup($tabGroup) && window.localStorage) {
                var tabGroupId = $tabGroup.attr("id");
                if (tabGroupId) {
                    var persistentTabId = window.localStorage.getItem(createPersistentKey($tabGroup));
                    if (persistentTabId) {
                        var $tabmatch = $tabGroup.find("#" + persistentTabId);

                        if ($tabmatch.length) {
                            switchToTab($tabmatch);
                        }
                    }
                } else {
                    AJS.warn("A tab group must specify an id attribute if it specifies data-aui-persist");
                }
            }
        }
    }

    function updateLocalStorageEntry($tab) {
        var $tabGroup = $tab.closest(".aui-tabs");

        var tabGroupId = $tabGroup.attr("id");
        if (tabGroupId){
            var tabId = $tab.attr("id");
            if (tabId) {
                window.localStorage.setItem(createPersistentKey($tabGroup),tabId);
            }
        } else {
            AJS.warn("A tab group must specify an id attribute if it specifies data-aui-persist");
        }
    }

    function handleTabClick(e) {
        AJS.tabs.change($(this), e);
        e && e.preventDefault();
    }

    function responsiveResizeHandler(tabs) {
        tabs.forEach(function (tab, index) {
            calculateResponsiveTabs(tab, index);
        });
    }

    AJS.tabs = {
        setup: function () {
            var $allTabs = $(".aui-tabs:not(.aui-tabs-disabled)");
            var allResponsiveTabs = $(RESPONSIVE_OPT_IN_SELECTOR).toArray();

            responsiveResizeHandler(allResponsiveTabs);

            var debouncedResponsiveResizeHandler = AJS.debounce(responsiveResizeHandler, 200);
            $(window).resize(function(){
                debouncedResponsiveResizeHandler(allResponsiveTabs);
            });

            // Non-menu ARIA setup
            $allTabs.attr("role","application");
            $allTabs.find(".tabs-pane").each( function() {
                var thisPane = $(this);
                thisPane.attr("role","tabpanel");
                if (thisPane.hasClass(ACTIVE_PANE)) {
                    thisPane.attr(ARIA_HIDDEN,"false");
                } else {
                    thisPane.attr(ARIA_HIDDEN,"true");
                }
            });

            // Menu setup
            for (var i=0, ii = $allTabs.length; i < ii; i++) {
                var $tab = $allTabs.eq(i);
                if (!$tab.data("aui-tab-events-bound")) {
                    var $tabMenu = $tab.children("ul.tabs-menu");

                    // ARIA setup
                    $tabMenu.attr("role","tablist");
                    $tabMenu.children("li").attr("role","presentation"); // ignore the LIs so tab count is announced correctly
                    $tabMenu.find("> .menu-item a").each(enhanceTabLink);

                    // Set up click event for tabs
                    $tabMenu.delegate("a", "click", handleTabClick);
                    $tab.data("aui-tab-events-bound", true);
                }
            }


            updateTabsFromLocalStorage($allTabs);

            // Vertical tab truncation setup (adds title if clipped)
            $(".aui-tabs.vertical-tabs").find("a").each(function() {
                var thisTab = $(this);
                // don't override existing titles
                if ( !thisTab.attr("title") ) {
                    // if text has been truncated, add title
                    if ( AJS.isClipped(thisTab) ) {
                        thisTab.attr("title", thisTab.text());
                    }
                }
            });
        },
        change: function ($a, e) {
            switchToTab($a);

            var $tabGroup = $a.closest(".aui-tabs");
            if (isPersistentTabGroup($tabGroup) && window.localStorage) {
                updateLocalStorageEntry($a);
            }
        }
    };
    $(AJS.tabs.setup);
})(AJS.$);
