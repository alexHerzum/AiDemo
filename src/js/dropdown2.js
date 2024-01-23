/**
 * Dropdown 2
 */
(function ($) {

    var $document = $(document);

    // reference to currently active dropdown events object
    var activeDropdownEvents = null;

    function preventDefault(event) {
        event.preventDefault();
    }

    function isDropdownVisible($el) {
        return $el[0].getAttribute("aria-hidden") !== 'true' &&  $el.is(":visible");
    }

    var BUTTON = (function () {
        var isMouseDown = false;

        function onmousedown(event) {
            if (!isMouseDown && event.which === 1) { // Left-click only
                isMouseDown = true;
                $document.bind("mouseup mouseleave", onmouseup);
                $(this).trigger("aui-button-invoke");
            }
        }

        function onmouseup() {
            $document.unbind("mouseup mouseleave", onmouseup);
            setTimeout(function () {
                isMouseDown = false;
            }, 0);
        }

        function onclick() {
            if (!isMouseDown) {
                $(this).trigger("aui-button-invoke");
            }
        }

        if (typeof document.addEventListener === "undefined") {
            return {
                "click":onclick,
                "click selectstart":preventDefault,
                "mousedown":function (event) {
                    var currentTarget = this;
                    var activeElement = document.activeElement;

                    function onbeforedeactivate(event) {
                        // Prevent this "mousedown" event from moving focus
                        // to currentTarget, or away from activeElement.
                        switch (event.toElement) {
                            case null:
                            case currentTarget:
                            case document.body:
                            case document.documentElement:
                                event.returnValue = false;
                        }
                    }

                    onmousedown.call(this, event);
                    if (activeElement !== null) {
                        activeElement.attachEvent("onbeforedeactivate", onbeforedeactivate);
                        setTimeout(function () {
                            activeElement.detachEvent("onbeforedeactivate", onbeforedeactivate);
                        }, 0);
                    }
                }
            };
        }
        return {
            "click":onclick,
            "click mousedown":preventDefault,
            "mousedown":onmousedown
        };
    })();

    var DROPDOWN_TRIGGER = {
        "aui-button-invoke": function (event, options) {
            options = $.extend({
                selectFirst: true
            }, options);

            var $dropdown = getDropdownForTrigger(this);
            var $trigger = $(this).addClass("active aui-dropdown2-active");
            var isSubmenu = $trigger.hasClass("aui-dropdown2-sub-trigger");

            //HIDE LOCATION
            var hideParent = $dropdown.parent()[0];  //remember the immediate parent of the dropdown before it was shown
            var hideSibling = $dropdown.next()[0];     //remeber the immediate next sibling of the dropdown before it was shown
            var hideLocation = $(this).attr("data-dropdown2-hide-location"); //set the hide location according to the data-dropdown2-hide-location attribute

            if (hideLocation) {
                var hideEl = document.getElementById(hideLocation);
                if (hideEl) {
                    hideParent = $(hideEl); //use the specified element to hide the dropdown
                    hideSibling = undefined;    //if there is a specified hide location don't use the sibling for hiding.
                } else {
                    throw new Error("The specified data-dropdown2-hide-location id doesn't exist");
                }
            }

            var $menu = options.$menu || $trigger.closest(".aui-dropdown2-trigger-group");

            if (isSubmenu) {
                var $parent = $trigger.closest(".aui-dropdown2");

                // inherit dropdown styles from the parent
                $dropdown.addClass($parent.attr("class")).addClass("aui-dropdown2-sub-menu");
            }

            var ITEM = {
                "click": function (e) {
                    var $this = $(this);
                    if (!isItemEnabled($this)) {
                        return;
                    }

                    if (!$this.hasClass("interactive") && !$this.hasClass("aui-dropdown2-interactive")) {
                        hideAll();
                    }

                    // potential support for mobile devices where submenus are opened
                    // by click instead of hover events
                    if (isSubmenuTrigger($this)) {
                        invokeItem($this, { selectFirst: false });
                        preventDefault(e);
                    }
                },
                "mousemove": function () {
                    var $this = $(this);
                    var newItemSelected = selectItem($this);

                    if (newItemSelected) {
                        invokeItem($this, { selectFirst: false });
                    }
                }
            };

            var DROPDOWN = {
                "click focusin mousedown": function (event) {
                    var target = event.target;
                    if (document === target && event.type === "focusin") {
                        return; // Firefox will trigger focusin on document when focus leaves an iframe.
                    }
                    if (!inside(target, $dropdown[0]) && !inside(target, $trigger[0])) {
                        hideAll();
                    }
                },
                "keydown": function (event) {
                    var $item;
                    if (event.shiftKey && event.keyCode == 9) {
                        selectNextItem(-1); // Shift tab
                    } else {
                        switch (event.keyCode) {
                            case 13: // Return
                                $item = activeItem();
                                if (isSubmenuTrigger($item)) {
                                    invokeItem($item);
                                } else {
                                    click($item[0]);
                                }

                                break;
                            case 27: // Escape
                                hide();
                                break;
                            case 37: // Left
                                $item = activeItem();
                                if (isSubmenuTrigger($item)) {
                                    var $submenu = getDropdownForTrigger($item);
                                    if (isDropdownVisible($submenu)) {
                                        $dropdown.trigger("aui-dropdown2-step-out");
                                        return;
                                    }
                                }

                                if (isSubmenu) {
                                    hide();
                                } else {
                                    selectNextMenu(-1);
                                }
                                break;
                            case 38: // Up
                                selectNextItem(-1);
                                break;
                            case 39: // Right
                                $item = activeItem();
                                if (isSubmenuTrigger($item)) {
                                    invokeItem($item);
                                } else {
                                    selectNextMenu(1);
                                }
                                break;
                            case 40: // Down
                                selectNextItem(1);
                                break;
                            case 9: // Tab
                                selectNextItem(1);
                                break;
                            default:
                                // Don't prevent the default action for other keys.
                                return;
                        }
                    }
                    preventDefault(event);
                }
            };

            // ARIA - sets item role (checkbox or radio)
            // for radio, also sets containing UL to role=radiogroup
            function dropdown2AriaMenus($elements, role) {
                $elements.each(function () {
                    var $el = $(this);
                    $el.attr("role", role);
                    if ($el.hasClass("checked") || $el.hasClass("aui-dropdown2-checked")) {
                        $el.attr("aria-checked", "true");
                        if (role == "radio") {
                            $el.closest("ul").attr("role", "radiogroup");
                        }
                    } else {
                        $el.attr("aria-checked", "false");
                    }
                });
            }

            $trigger.attr("aria-controls", $trigger.attr("aria-owns"));

            $dropdown.find(".disabled,.aui-dropdown2-disabled").attr("aria-disabled", "true");
            $dropdown.find("li.hidden > a,li.aui-dropdown2-hidden > a").addClass("disabled aui-dropdown2-disabled").attr("aria-disabled", "true");
            dropdown2AriaMenus($dropdown.find(".aui-dropdown2-checkbox"), "checkbox");
            dropdown2AriaMenus($dropdown.find(".aui-dropdown2-radio"), "radio");

            function setPosition() {
                var trOffset = $trigger.offset();
                var trWidth = $trigger.outerWidth();
                // If the dropdown is positioned on the far right of the screen and the contents
                // of the dropdown is larger than the min-width and the dropdown would be
                // partially offscreen if it were visible, the incorrect outerWidth() would
                // be calculated. As a result we zero out the top/left to ensure it is never
                // partially positioned offscreen
                $dropdown.css({ left: 0, top: 0 });
                var ddWidth = $dropdown.outerWidth();
                var docWidth = $("body").outerWidth(true); //use body width instead of document width because jQuery doesn't account for scrollbar in IE
                var minWidth = Math.max(parseInt($dropdown.css("min-width"), 10), trWidth);
                var ddContainer = $trigger.data("container") || false;
                var ddAlignment = "left";
                var horizontalBorderWidth;

                if (!isSubmenu) {
                    $dropdown.css("min-width", minWidth + "px");
                }

                var left = trOffset.left,
                    top  = trOffset.top + $trigger.outerHeight();

                if (isSubmenu) {
                    // submenus are aligned next to the trigger, not below it
                    // the offset pushes the submenu slightly to the left to overlap with the parent
                    var offset = 3;
                    left = trOffset.left + $parent.outerWidth() - offset;
                    top  = trOffset.top;
                }

                // If there isn't enough available space to left-align the dropdown,
                // make it right-aligned instead.
                if (docWidth < left + ddWidth && ddWidth <= left + trWidth) {
                    left = trOffset.left + trWidth - ddWidth;
                    if (isSubmenu) {
                        left = trOffset.left - ddWidth;
                    }
                    ddAlignment = "right";
                }

                // where dropdown declares a container element other than body,
                // check if it needs to flip to right-aligned
                // todo: rationalise this and the default logic
                // todo: rationalise this and the default logic
                if (ddContainer) {
                    var container = $trigger.closest(ddContainer),
                        triggerRight = $trigger.offset().left + $trigger.outerWidth(),
                        dropdownRight = triggerRight + ddWidth;

                    // first-load bug only seems to affect custom-boundary elements
                    if (minWidth >= ddWidth) {
                        ddWidth = minWidth;
                    }

                    // if the dropdown don't fit you must acquit. and align right.
                    if (dropdownRight > triggerRight) {
                        left = triggerRight - ddWidth;
                        ddAlignment = "right";
                    }
                }

                $dropdown.attr({
                    "data-dropdown2-alignment": ddAlignment,
                    "aria-hidden": "false"
                }).css({
                    display: "block",
                    left: left + "px",
                    top: top + "px"
                });

                // Ensure the dropdown element is always document.body.lastChild to
                // preserve z-axis stacking order.
                $dropdown.appendTo(document.body);
            }

            setPosition();

            // Integration with AUI Toolbar v1
            if ($trigger.hasClass("toolbar-trigger")) {
                $dropdown.addClass("aui-dropdown2-in-toolbar");
            }
            // Integration with AUI Buttons v1
            if ($trigger.parent().hasClass("aui-buttons")) {
                $dropdown.addClass("aui-dropdown2-in-buttons");
            }
            // Integration with AUI Header v1
            if ($trigger.parents().hasClass("aui-header")) {
                $dropdown.addClass("aui-dropdown2-in-header");
            }

            $dropdown.trigger("aui-dropdown2-show", options);

            if (options.selectFirst) {
                selectFirstItem();
            }

            setEvents("on");
            function hide() {
                disableDropdownEvents();
                setEvents("off");
                // Event handlers that are currently running may expect the dropdown
                // element to remain  within the document. Wait until these handlers
                // complete before removing the dropdown element.
                setTimeout(function () {
                    // Hide the dropdown element but don't remove it from the document
                    // so that its contents remains accessible to external code.
                    $dropdown.css("display", "none").css("min-width", "").insertAfter($trigger).attr("aria-hidden", "true");

                    if (!isSubmenu) {
                        $trigger.removeClass("active aui-dropdown2-active");
                    }

                    activeItem().removeClass("active aui-dropdown2-active");

                    $dropdown.removeClass("aui-dropdown2-in-toolbar");
                    // insert after the trigger breaks buttons; insert after buttons breaks toolbar2
                    // insert before buttons is ok!
                    $dropdown.removeClass("aui-dropdown2-in-buttons");

                    //If there is an original sibling for the dropdown insert it after that when hiding, otherwise use the hide parent.
                    if (hideSibling) {
                        $dropdown.insertBefore(hideSibling);
                    } else {
                        $dropdown.appendTo(hideParent);
                    }

                    $dropdown.trigger("aui-dropdown2-hide");
                }, 0);
            }

            /**
             * Hide this dropdown and then tell parent to hide as well.
             */
            function hideAll() {
                hide();
                if (isSubmenu) {
                    $parent.trigger("aui-dropdown2-hide-all");
                }
            }

            /**
             * Hide if event is triggered by parent.
             * @param event
             */
            function hideForParent(event) {
                if (isSubmenu && event.target === $parent[0]) {
                    hide();
                }
            }

            function isItemEnabled($item) {
                return !$item.is(".disabled, .aui-dropdown2-disabled, [aria-disabled=true]");
            }

            function isSubmenuTrigger($item) {
                return $item.hasClass("aui-dropdown2-sub-trigger");
            }

            /**
             * Invokes the item's submenu if it has one. If the submenu is still hidden then show it,
             * otherwise select the first item.
             *
             */
            function invokeItem($item, options) {
                if (!isSubmenuTrigger($item)) {
                    return;
                }

                options = $.extend({}, options, {
                    $menu: $menu
                });

                var $dropdown = getDropdownForTrigger($item);
                if (isDropdownVisible($dropdown)) {
                    $dropdown.trigger("aui-dropdown2-select-first");
                } else {
                    $item.trigger("aui-button-invoke", options);
                }
            }

            function activeItem() {
                return $dropdown.find("a.active,a.aui-dropdown2-active");
            }

            var $currentItem = null;
            function selectItem($next) {
                if ($currentItem && $currentItem[0] === $next[0]) {
                    return false;
                }
                $currentItem = $next;

                activeItem().removeClass("active aui-dropdown2-active");

                if (isItemEnabled($next)) {
                    $next.addClass("active aui-dropdown2-active");
                }

                $dropdown.trigger("aui-dropdown2-item-selected");

                // enable dropdown events once an item in this dropdown has been selected
                enableDropdownEvents();

                return true;
            }


            function selectFirstItem() {
                selectItem($dropdown.find("a:not(.disabled):not(.aui-dropdown2-disabled)").first());
            }

            function selectNextItem(offset) {
                // only find the first level of items (do not include items in submenus)
                var items = $dropdown.find("> ul > li > a, > .aui-dropdown2-section > ul > li > a").not(".disabled,.aui-dropdown2-disabled");
                selectItem(getByOffset(items, offset, true));
            }

            function selectMenu($next) {
                if ($next.length > 0) {
                    hideAll();
                    $next.trigger("aui-button-invoke");
                }
            }

            function selectNextMenu(offset) {
                selectMenu(getByOffset($menu.find(".aui-dropdown2-trigger").not(".disabled, .aui-dropdown2-disabled, [aria-disabled=true], .aui-dropdown2-sub-trigger"), offset, false));
            }

            function getByOffset($collection, offset, wrap) {
                var i = $collection.index($collection.filter(".active,.aui-dropdown2-active"));
                i += (i < 0 && offset < 0) ? 1 : 0; // Correct for case where i == -1.
                i += offset;
                if (wrap) {
                    i %= $collection.length;
                } else if (i < 0) {
                    i = $collection.length; // Out of bounds
                }
                return $collection.eq(i);
            }

            function replaceMenu() {
                selectMenu($(this));
            }

            function disableDropdownEvents() {
                // unbind dropdown events on hiding
                if (activeDropdownEvents === DROPDOWN) {
                    $document.unbind(DROPDOWN);
                    activeDropdownEvents = null;
                }
            }

            function enableDropdownEvents() {
                if (activeDropdownEvents === DROPDOWN) {
                    return;
                }

                $document.unbind(activeDropdownEvents);
                $document.bind(DROPDOWN);
                activeDropdownEvents = DROPDOWN;
            }

            function setEvents(state) {
                var bind = "bind";
                var delegate = "delegate";
                if (state !== "on") {
                    bind = "unbind";
                    delegate = "undelegate";
                }

                if (!isSubmenu) {
                    $menu[delegate](".aui-dropdown2-trigger:not(.active):not(.aui-dropdown2-active)", "mousemove", replaceMenu);
                    $trigger[bind]("aui-button-invoke", hide);
                } else {
                    // There are a few reasons why this dropdown should hide in response to an action on the parent:
                    // - the parent was hidden
                    // - a new item was selected in the parent
                    // - the dropdown was opened via hovering over an item in the parent and the left key was pressed
                    // In any case we hide this dropdown if the event was thrown by the direct parent.
                    $parent[bind]("aui-dropdown2-hide aui-dropdown2-item-selected aui-dropdown2-step-out", hideForParent);
                }

                // hide when children requested dropdown close
                $dropdown[bind]("aui-dropdown2-hide-all", hideAll);

                $dropdown[delegate]("a", ITEM);

                // activate current dropdown events when a child has been closed (and therefore threw its event)
                $dropdown[bind]("aui-dropdown2-hide", enableDropdownEvents);

                // listen for events to select the first item
                $dropdown[bind]("aui-dropdown2-select-first", selectFirstItem);
            }
        },
        "mousedown": function (event) {
            if (event.which === 1) { // Left-click only
                $(this).bind(SIMULATE_CLICK_ENABLE);
            }
        }
    };

    var SIMULATE_CLICK_ENABLE = {
        "mouseleave":function () {
            $document.bind(SIMULATE_CLICK);
        },
        "mouseup mouseleave":function () {
            $(this).unbind(SIMULATE_CLICK_ENABLE);
        }
    };

    var SIMULATE_CLICK = {
        "mouseup":function (event) {
            var target = $(event.target).closest(".aui-dropdown2 a, .aui-dropdown2-trigger")[0];
            if (target) {
                setTimeout(function () {
                    click(target);
                }, 0);
            }
        },
        "mouseup mouseleave":function () {
            $(this).unbind(SIMULATE_CLICK);
        }
    };

    function click(element) {
        if (element.click) {
            element.click();
        } else {
            var event = document.createEvent("MouseEvents");
            event.initMouseEvent("click",
                true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(event);
        }
    }

    function inside(target, container) {
        return (target === container) || $.contains(container, target);
    }

    function getDropdownForTrigger(triggerElement) {
        if (!(triggerElement instanceof AJS.$)) {
            triggerElement = $(triggerElement);
        }

        var id = triggerElement.attr("aria-owns"),
            haspopup = triggerElement.attr("aria-haspopup"),
            el = document.getElementById(id);
        if (el) {
            return $(el);
        } else {
            if (!id) {
                throw new Error("Dropdown 2 trigger required attribute not set: aria-owns");
            }
            if (!haspopup) {
                throw new Error("Dropdown 2 trigger required attribute not set: aria-haspopup");
            }
            if (!el) {
                throw new Error("Dropdown 2 trigger aria-owns attr set to nonexistent id: " + id);
            }
            throw new Error("Dropdown 2 trigger unknown error. I don't know what you did, but there's smoke everywhere. Consult the documentation.");
        }
    }

    // Initialise events for default dropdown className.
    $document.delegate(".aui-dropdown2-trigger", BUTTON);
    $document.delegate(".aui-dropdown2-trigger:not(.active):not(.aui-dropdown2-active):not([aria-disabled=true])," +
                       ".aui-dropdown2-sub-trigger:not([aria-disabled=true])", DROPDOWN_TRIGGER);

    // Checkboxes
    $document.delegate(".aui-dropdown2-checkbox:not(.disabled):not(.aui-dropdown2-disabled)", "click", function () {
        var $checkbox = $(this);
        if ($checkbox.hasClass("checked") || $checkbox.hasClass("aui-dropdown2-checked")) {
            $checkbox.removeClass("checked aui-dropdown2-checked").attr("aria-checked", "false");
            $checkbox.trigger("aui-dropdown2-item-uncheck");
        } else {
            $checkbox.addClass("checked aui-dropdown2-checked").attr("aria-checked", "true");
            $checkbox.trigger("aui-dropdown2-item-check");
        }
    });

    // Radio button groups
    $document.delegate(".aui-dropdown2-radio:not(.checked):not(.aui-dropdown2-checked):not(.disabled):not(.aui-dropdown2-disabled)", "click", function () {
        var $next = $(this);
        var $prev = $next.closest("ul").find(".checked,.aui-dropdown2-checked");
        $prev.removeClass("checked aui-dropdown2-checked").attr("aria-checked", "false").trigger("aui-dropdown2-item-uncheck");
        $next.addClass("checked aui-dropdown2-checked").attr("aria-checked", "true").trigger("aui-dropdown2-item-check");
    });

    // Disabled items
    $document.delegate(".aui-dropdown2 a.disabled,.aui-dropdown2 a.aui-dropdown2-disabled", "click", function (event) {
        preventDefault(event);
    });

})(AJS.$);
