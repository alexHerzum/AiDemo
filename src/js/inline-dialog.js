/*global Raphael: true */
/*jshint quotmark:false, eqeqeq:false, strict:false */

(function($) {
    /**
     * Creates a new inline dialog.
     *
     * @class InlineDialog
     * @namespace AJS
     * @constructor
     * @param items jQuery object - the items that trigger the display of this popup when the user mouses over.
     * @param identifier A unique identifier for this popup. This should be unique across all popups on the page and a valid CSS class.
     * @param url The URL to retrieve popup contents.
     * @param options Custom options to change default behaviour. See AJS.InlineDialog.opts for default values and valid options.
     */
    AJS.InlineDialog = function (items, identifier, url, options) {
        options = options || [];
        if (options.hasOwnProperty('getArrowAttributes')) {
            getArrowAttributesDeprecationLogger();
        }

        if (options.hasOwnProperty('getArrowPath')) {
            getArrowPathDeprecationLogger();
            if (options.hasOwnProperty('gravity')) {
                getArrowPathWithGravityDeprecationLogger();
            }
        }

        if (options.hasOwnProperty('onTop')) {
            onTopDeprecationLogger();
            if (options.onTop && options.gravity === undefined) {
                options.gravity = 's';
            }
        }

        // attempt to generate a random identifier if it doesn't exist
        if (typeof identifier === 'undefined') {

            identifier = String(Math.random()).replace('.', '');

            // if the generated supplied identifier already exists when combined with the prefixes we'll be using, then bail
            if ($('#inline-dialog-' + identifier + ', #arrow-' + identifier + ', #inline-dialog-shim-' + identifier).length) {
                throw 'GENERATED_IDENTIFIER_NOT_UNIQUE';
            }

        }

        var opts = $.extend(false, AJS.InlineDialog.opts, options);
        if (opts.gravity === 'w') {
            // TODO Once support for gravity: 'e' is added, it should also
            //      transpose the defaults for offsetX and offsetY.
            opts.offsetX = options.offsetX === undefined ? 10 : options.offsetX;
            opts.offsetY = options.offsetY === undefined ? 0 : options.offsetY;
        }
        var renderAsSVG = function() {
            return window.Raphael && options && (options.getArrowPath || options.getArrowAttributes);
        };

        var hash;
        var hideDelayTimer;
        var showTimer;
        var beingShown = false;
        var shouldShow = false;
        var contentLoaded = false;
        var mousePosition;
        var targetPosition;
        var popup  = $('<div id="inline-dialog-' + identifier
            + '" class="aui-inline-dialog"><div class="aui-inline-dialog-contents contents"></div><div id="arrow-' +
            identifier + '" class="aui-inline-dialog-arrow arrow"></div></div>');

        var arrow = $("#arrow-" + identifier, popup);
        var contents = popup.find(".contents");

        if (!renderAsSVG()) {
            popup.find(".aui-inline-dialog-arrow").addClass("aui-css-arrow");
        }

        if (!opts.displayShadow) {
            contents.addClass('aui-inline-dialog-no-shadow');
        }
        
        if (opts.autoWidth) {
            contents.addClass('aui-inline-dialog-auto-width');
        } else {
            contents.css("width", opts.width + "px");
        }

        contents.on({
            'mouseenter': function() {
                clearTimeout(hideDelayTimer);
                popup.unbind("mouseenter");
            },
            'mouseleave': function() {
                hidePopup();
            }
        });

        var getHash = function () {
            if (!hash) {
                hash = {
                    popup: popup,
                    hide: function(){
                        hidePopup(0);
                    },
                    id: identifier,
                    show: function(){
                        showPopup();
                    },
                    persistent: opts.persistent ? true : false,
                    reset: function () {

                        function drawPopup (popup, positions) {
                            //Position the popup using the left and right parameters
                            popup.css(positions.popupCss);

                            if (renderAsSVG()) {
                                //special adjustment for downards raphael arrow
                                if (positions.gravity === 's'){
                                    positions.arrowCss.top -= $.browser.msie ? 10 : 9;
                                }

                                if (!popup.arrowCanvas) {
                                    popup.arrowCanvas = Raphael("arrow-"+identifier, 16, 16);  //create canvas using arrow element
                                }
                                var getArrowPath = opts.getArrowPath,
                                    arrowPath = $.isFunction(getArrowPath) ?
                                        getArrowPath(positions) :
                                        getArrowPath;
                                //draw the arrow
                                popup.arrowCanvas
                                    .path(arrowPath)
                                    .attr(opts.getArrowAttributes());

                            } else {
                                arrow.removeClass('aui-bottom-arrow aui-left-arrow aui-right-arrow');
                                if (positions.gravity === 's' && !arrow.hasClass("aui-bottom-arrow")) {
                                    arrow.addClass("aui-bottom-arrow");
                                } else if (positions.gravity === 'n') {
                                    // Default styles are for 'n' gravity.
                                } else if (positions.gravity === 'w') {
                                    arrow.addClass('aui-left-arrow');
                                } else if (positions.gravity === 'e') {
                                    arrow.addClass('aui-right-arrow');
                                }
                            }


                            arrow.css(positions.arrowCss);
                        }

                        //DRAW POPUP
                        var viewportHeight = AJS.$(window).height();
                        var popupMaxHeight = Math.round(viewportHeight * 0.75);
                        popup.children('.aui-inline-dialog-contents')
                            .css('max-height', popupMaxHeight);

                        var positions = opts.calculatePositions(popup, targetPosition, mousePosition, opts);
                        if (positions.hasOwnProperty('displayAbove')) {
                            displayAboveDeprecationLogger();
                            positions.gravity = positions.displayAbove ? 's' : 'n';
                        }

                        drawPopup(popup, positions);

                        // reset position of popup box
                        popup.fadeIn(opts.fadeTime, function() {
                            // once the animation is complete, set the tracker variables
                            // beingShown = false; // is this necessary? Maybe only the shouldShow will have to be reset?
                        });

                        if ($.browser.msie && ~~($.browser.version) < 10) {
                            // iframeShim, prepend if it doesnt exist
                            var jQueryCache = $('#inline-dialog-shim-' + identifier);
                            if (!jQueryCache.length) {
                                $(popup).prepend($('<iframe class = "inline-dialog-shim" id="inline-dialog-shim-' + identifier + '" frameBorder="0" src="javascript:false;"></iframe>'));
                            }
                            // adjust height and width of shim according to the popup
                            jQueryCache.css({
                                width: contents.outerWidth(),
                                height: contents.outerHeight()
                            });
                        }
                    }
                };
            }
            return hash;
        };

        var showPopup = function() {
            if (popup.is(":visible")) {
                return;
            }
            showTimer = setTimeout(function() {
                if (!contentLoaded || !shouldShow) {
                    return;
                }
                opts.addActiveClass && $(items).addClass("active");
                beingShown = true;
                if (!opts.persistent) {
                    bindHideEvents();
                }
                AJS.InlineDialog.current = getHash();
                $(document).trigger("showLayer", ["inlineDialog", getHash()]);
                // retrieve the position of the click target. The offsets might be different for different types of targets and therefore
                // either have to be customisable or we will have to be smarter about calculating the padding and elements around it

                getHash().reset();

            }, opts.showDelay);
        };

        var hidePopup = function(delay) {
            // do not auto hide the popup if persistent is set as true
            if (typeof delay == 'undefined' && opts.persistent) {
                return;
            }
            if (typeof popup.get(0)._datePickerPopup !== 'undefined') {
                // AUI-2696 - This inline dialog is host to a date picker... so we shouldn't close it.
                return;
            }

            shouldShow = false;
            // only exectute the below if the popup is currently being shown
            // and the arbitrator callback gives us the green light
            if (beingShown && opts.preHideCallback.call(popup[0].popup)) {
                delay = (delay == null) ? opts.hideDelay : delay;
                clearTimeout(hideDelayTimer);
                clearTimeout(showTimer);
                // store the timer so that it can be cleared in the mouseenter if required
                //disable auto-hide if user passes null for hideDelay
                if (delay != null) {
                    hideDelayTimer = setTimeout(function() {
                        unbindHideEvents();
                        opts.addActiveClass && $(items).removeClass("active");
                        popup.fadeOut(opts.fadeTime, function() { opts.hideCallback.call(popup[0].popup); });
                        //If there's a raphael arrow remove it properly
                        if(popup.arrowCanvas){
                            popup.arrowCanvas.remove();
                            popup.arrowCanvas = null;
                        }
                        beingShown = false;
                        shouldShow = false;
                        $(document).trigger("hideLayer", ["inlineDialog", getHash()]);
                        AJS.InlineDialog.current = null;
                        if (!opts.cacheContent) {
                            //if not caching the content, then reset the
                            //flags to false so as to reload the content
                            //on next mouse hover.
                            contentLoaded = false;
                            contentLoading = false;
                        }

                    }, delay);
                }

            }
        };

        // the trigger is the jquery element that is triggering the popup (i.e., the element that the mousemove event is bound to)
        var initPopup = function(e, trigger) {
            var $trigger = $(trigger);

            opts.upfrontCallback.call({
                popup: popup,
                hide: function () {hidePopup(0);},
                id: identifier,
                show: function () {showPopup();}
            });

            popup.each(function() {
                if (typeof this.popup != "undefined") {
                    this.popup.hide();
                }
            });

            //Close all other popups if neccessary
            if (opts.closeOthers) {
                $(".aui-inline-dialog").each(function() {
                    !this.popup.persistent && this.popup.hide();
                });
            }

            //handle programmatic showing where there is no event
            targetPosition = {target: $trigger};
            if (!e) {
                mousePosition = { x: $trigger.offset().left, y: $trigger.offset().top };
            } else {
                mousePosition = { x: e.pageX, y: e.pageY };
            }



            if (!beingShown) {
                clearTimeout(showTimer);
            }
            shouldShow = true;
            var doShowPopup = function() {
                contentLoading = false;
                contentLoaded = true;
                opts.initCallback.call({
                    popup: popup,
                    hide: function () {hidePopup(0);},
                    id: identifier,
                    show: function () {showPopup();}
                });
                showPopup();
            };
            // lazy load popup contents
            if (!contentLoading) {
                contentLoading = true;
                if ($.isFunction(url)) {
                    // If the passed in URL is a function, execute it. Otherwise simply load the content.
                    url(contents, trigger, doShowPopup);
                } else {
                    //Retrive response from server
                    $.get(url, function (data, status, xhr) {
                        //Load HTML contents into the popup
                        contents.html(opts.responseHandler(data, status, xhr));
                        //Show the popup
                        contentLoaded = true;
                        opts.initCallback.call({
                            popup: popup,
                            hide: function () {hidePopup(0);},
                            id: identifier,
                            show: function () {showPopup();}
                        });
                        showPopup();
                    });
                }
            }
            // stops the hide event if we move from the trigger to the popup element
            clearTimeout(hideDelayTimer);
            // don't trigger the animation again if we're being shown
            if (!beingShown) {
                showPopup();
            }
            return false;
        };

        popup[0].popup = getHash();

        var contentLoading = false;
        var added  = false;
        var appendPopup = function () {
            if (!added) {
                $(opts.container).append(popup);
                added = true;
            }
        };
        var $items = $(items);

        if (opts.onHover) {
            if (opts.useLiveEvents) {
                // We're using .on() to emulate the behaviour of .live() here. on() requires the jQuery object to have
                // a selector - this is actually how .live() is implemented in jQuery 1.7+.
                // Note that .selector is deleted in jQuery 1.9+.
                // This means that jQuery objects created by selection eg $(".my-class-selector") will work, but
                // object created by DOM parsing eg $("<div class='.my-class'></div>") will not work.
                // Ideally we should throw an error if the $items has no selector but that is backwards incompatible,
                // so we warn and do a no-op - this emulates the behaviour of live() but has the added warning.
                if ($items.selector) {
                    $(document).on("mouseenter", $items.selector, function(e) {
                        appendPopup();
                        initPopup(e, this);
                    }).on("mouseleave", $items.selector, function() {
                        hidePopup();
                    });
                }
                else {
                    AJS.log("Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.");
                }
            } else {
                $items.on({
                    'mouseenter': function(e) {
                        appendPopup();
                        initPopup(e,this);
                    },
                    'mouseleave': function() {
                        hidePopup();
                    }
                });
            }
        } else {
            if (!opts.noBind) {   //Check if the noBind option is turned on
                if (opts.useLiveEvents) {
                    // See above for why we filter by .selector
                    if ($items.selector) {
                        $(document).on("click", $items.selector, function(e) {
                            appendPopup();
                            if (shouldCloseOnTriggerClick()) {
                                popup.hide();
                            } else {
                                initPopup(e,this);
                            }
                            return false;
                        }).on("mouseleave", $items.selector, function() {
                            hidePopup();
                        });
                    }
                    else {
                        AJS.log("Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.");
                    }
                } else {
                    $items.on("click", function(e) {
                        appendPopup();
                        if (shouldCloseOnTriggerClick()) {
                            popup.hide();
                        } else {
                            initPopup(e,this);
                        }
                        return false;
                    }).on("mouseleave", function() {
                        hidePopup();
                    });
                }
            }
        }

        var shouldCloseOnTriggerClick = function() {
            return beingShown && opts.closeOnTriggerClick;
        }

        var bindHideEvents = function() {
            bindHideOnExternalClick();
            bindHideOnEscPressed();
        };

        var unbindHideEvents = function() {
            unbindHideOnExternalClick();
            unbindHideOnEscPressed();
        };

        // Be defensive and make sure that we haven't already bound the event
        var hasBoundOnExternalClick = false;
        var externalClickNamespace = identifier + ".inline-dialog-check";

        /**
         * Catch click events on the body to see if the click target occurs outside of this popup
         * If it does, the popup will be hidden
         */
        var bindHideOnExternalClick = function () {
            if (!hasBoundOnExternalClick) {
                $("body").bind("click." + externalClickNamespace, function(e) {
                    var $target = $(e.target);
                    // hide the popup if the target of the event is not in the dialog
                    if ($target.closest('#inline-dialog-' + identifier + ' .contents').length === 0) {
                        hidePopup(0);
                    }
                });
                hasBoundOnExternalClick = true;
            }
        };

        var unbindHideOnExternalClick = function () {
            if (hasBoundOnExternalClick) {
                $("body").unbind("click." + externalClickNamespace);
            }
            hasBoundOnExternalClick = false;
        };

        var onKeydown = function(e) {
            if (e.keyCode === 27) {
                hidePopup(0);
            }
        };

        var bindHideOnEscPressed = function() {
            $(document).on("keydown", onKeydown);
        };

        var unbindHideOnEscPressed = function() {
            $(document).off("keydown", onKeydown);
        };

        /**
         * Show the inline dialog.
         * @method show
         */
        popup.show = function (e, trigger) {
            if (e) {
                e.stopPropagation();
            }
            appendPopup();
            if (opts.noBind && !(items && items.length)) {
                initPopup(e, trigger === undefined ? e.target : trigger);
            } else {
                initPopup(e, items);
            }
        };
        /**
         * Hide the inline dialog.
         * @method hide
         */
        popup.hide = function () {
            hidePopup(0);
        };
        /**
         * Repositions the inline dialog if being shown.
         * @method refresh
         */
        popup.refresh = function () {
            if (beingShown) {
                getHash().reset();
            }
        };

        popup.getOptions = function(){
            return opts;
        };

        return popup;
    };

    function dimensionsOf(el) {
        var $el = $(el);
        var offset = $.extend({left: 0, top: 0}, $el.offset());
        return {
            left: offset.left,
            top: offset.top,
            width: $el.outerWidth(),
            height: $el.outerHeight()
        };
    }

    function getDimensions(popup, targetPosition, mousePosition, opts) {
        var offsetX = AJS.$.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
        var offsetY = AJS.$.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
        var arrowOffsetX = AJS.$.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
        var arrowOffsetY = AJS.$.isFunction(opts.arrowOffsetY) ? opts.arrowOffsetY(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetY;

        // Support positioning inside a scroll container other than <body>
        var isConstrainedScroll = opts.container.toLowerCase() !== 'body';
        var $scrollContainer = AJS.$(opts.container);
        var $scrollWindow = isConstrainedScroll ?
            AJS.$(opts.container).parent() :
            AJS.$(window);
        var scrollContainerOffset = isConstrainedScroll ?
            $scrollContainer.offset() : { left: 0, top: 0 };
        var scrollWindowOffset = isConstrainedScroll ?
            $scrollWindow.offset() : { left: 0, top: 0 };

        var trigger = targetPosition.target;
        var triggerOffset = trigger.offset();
        // Support SVG elements as triggers
        // TODO Should calculateNorthSouthPositions also try getBBox()?
        var triggerBBox = trigger[0].getBBox && trigger[0].getBBox();

        return {
            // determines how close to the edge the dialog needs to be before it is considered offscreen
            screenPadding: 10,
            // Min distance arrow needs to be from the edge of the dialog
            arrowMargin: 5,
            window: {
                top: scrollWindowOffset.top,
                left: scrollWindowOffset.left,
                scrollTop: $scrollWindow.scrollTop(),
                scrollLeft: $scrollWindow.scrollLeft(),
                width: $scrollWindow.width(),
                height: $scrollWindow.height()
            },
            scrollContainer: {
                width: $scrollContainer.width(),
                height: $scrollContainer.height()
            },
            // Position of the trigger is relative to the scroll container
            trigger: {
                top: triggerOffset.top - scrollContainerOffset.top,
                left: triggerOffset.left - scrollContainerOffset.left,
                width: triggerBBox ? triggerBBox.width : trigger.outerWidth(),
                height: triggerBBox ? triggerBBox.height : trigger.outerHeight()
            },
            dialog: {
                width: popup.width(),
                height: popup.height(),
                offset: {
                    top: offsetY,
                    left: offsetX
                }
            },
            arrow: {
                height: popup.find('.arrow').outerHeight(),
                offset: {
                    top: arrowOffsetY,
                    left: arrowOffsetX
                }
            }
        };
    }

    function calculateWestPositions(popup, targetPosition, mousePosition, opts) {
        var dimensions = getDimensions(popup, targetPosition, mousePosition, opts);
        var screenPadding = dimensions.screenPadding;
        var win = dimensions.window;
        var trigger = dimensions.trigger;
        var dialog = dimensions.dialog;
        var arrow = dimensions.arrow;
        var scrollContainer = dimensions.scrollContainer;

        var triggerScrollOffset = {
            top: trigger.top - win.scrollTop,
            left: trigger.left - win.scrollLeft
        };

        // Halves - because the browser doesn't do sub-pixel positioning, we need to consistently floor
        // all decimal values or you can get 1px jumps in arrow positioning when the dialog's height changes.
        var halfTriggerHeight = Math.floor(trigger.height / 2);
        var halfPopupHeight = Math.floor(dialog.height / 2);
        var halfArrowHeight = Math.floor(arrow.height / 2);

        // Figure out where to position the dialog, preferring the right (gravity: 'w').
        var spaceOnLeft = triggerScrollOffset.left - dialog.offset.left - screenPadding;

        // This implementation may not be suitable for horizontally scrolling containers
        var spaceOnRight = scrollContainer.width - triggerScrollOffset.left - trigger.width - dialog.offset.left - screenPadding;

        var enoughSpaceOnLeft = spaceOnLeft >= dialog.width;
        var enoughSpaceOnRight = spaceOnRight >= dialog.width;
        var gravity = !enoughSpaceOnRight && enoughSpaceOnLeft ? 'e' : 'w';

        // Screen padding needs to be adjusted if the arrow would extend into it
        var arrowScreenTop = triggerScrollOffset.top + halfTriggerHeight - halfArrowHeight;
        var arrowScreenBottom = win.height - arrowScreenTop - arrow.height;
        screenPadding = Math.min(screenPadding, arrowScreenTop - dimensions.arrowMargin);
        screenPadding = Math.min(screenPadding, arrowScreenBottom - dimensions.arrowMargin);

        // Figure out if the dialog needs to be adjusted up or down to fit on the screen
        var middleOfTrigger = triggerScrollOffset.top + halfTriggerHeight;
        var spaceAboveMiddleOfTrigger = Math.max(middleOfTrigger - screenPadding, 0);
        var spaceBelowMiddleOfTrigger = Math.max(win.height - middleOfTrigger - screenPadding, 0);

        var isOverflowingAbove = halfPopupHeight - dialog.offset.top > spaceAboveMiddleOfTrigger;
        var isOverflowingBelow = halfPopupHeight + dialog.offset.top > spaceBelowMiddleOfTrigger;

        var popupCss;
        var arrowCss;
        if (isOverflowingAbove) {
            popupCss = {
                top: win.scrollTop + screenPadding,
                left: gravity === 'w' ?
                    trigger.left + trigger.width + dialog.offset.left :
                    trigger.left - dialog.width - dialog.offset.left
            };
            arrowCss = {
                top: (trigger.top + halfTriggerHeight) - (popupCss.top + halfArrowHeight)
            };
        } else if (isOverflowingBelow) {
            popupCss = {
                top: win.scrollTop + win.height - dialog.height - screenPadding,
                left: gravity === 'w' ?
                    trigger.left + trigger.width + dialog.offset.left :
                    trigger.left - dialog.width - dialog.offset.left
            };
            arrowCss = {
                top: (trigger.top + halfTriggerHeight) - (popupCss.top + halfArrowHeight)
            };
        } else {
            popupCss = {
                top: trigger.top + halfTriggerHeight - halfPopupHeight + dialog.offset.top,
                left: gravity === 'w' ?
                    trigger.left + trigger.width + dialog.offset.left :
                    trigger.left - dialog.width - dialog.offset.left
            };
            arrowCss = {
                top: halfPopupHeight - halfArrowHeight + arrow.offset.top
            };
        }

        return {
            gravity: gravity,
            popupCss: popupCss,
            arrowCss: arrowCss
        };
    }

    function calculateNorthSouthPositions(popup, targetPosition, mousePosition, opts) {
        var offsetX = AJS.$.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
        var offsetY = AJS.$.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
        var arrowOffsetX = AJS.$.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
        var arrowOffsetY = AJS.$.isFunction(opts.arrowOffsetY) ? opts.arrowOffsetY(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetY;

        var viewportDimensions = dimensionsOf(window);
        var targetDimensions = dimensionsOf(targetPosition.target);
        var popupDimensions = dimensionsOf(popup);
        var arrowDimensions = dimensionsOf(popup.find(".aui-inline-dialog-arrow"));

        var middleOfTrigger = targetDimensions.left + targetDimensions.width/2; //The absolute x position of the middle of the Trigger
        var bottomOfViewablePage = (window.pageYOffset || document.documentElement.scrollTop) + viewportDimensions.height;
        var SCREEN_PADDING = 10; //determines how close to the edge the dialog needs to be before it is considered offscreen

        // Set popup's position (within the viewport)
        popupDimensions.top = targetDimensions.top + targetDimensions.height + ~~offsetY;
        popupDimensions.left = targetDimensions.left + ~~offsetX;

        // Calculate if the popup would render off the side of the viewport
        var diff = viewportDimensions.width - (popupDimensions.left + popupDimensions.width + SCREEN_PADDING);

        // Set arrow's position (within the popup)
        arrowDimensions.left = middleOfTrigger - popupDimensions.left + ~~arrowOffsetX;
        // TODO arrowDimensions.top should also use arrowOffsetY.
        arrowDimensions.top = -(arrowDimensions.height/2);

        // Check whether the popup should display above or below the trigger
        var enoughRoomAbove = targetDimensions.top > popupDimensions.height;
        var enoughRoomBelow = (popupDimensions.top + popupDimensions.height) < bottomOfViewablePage;
        var displayAbove = (!enoughRoomBelow && enoughRoomAbove) || (enoughRoomAbove && opts.gravity === 's');

        if (displayAbove) {
            popupDimensions.top = targetDimensions.top - popupDimensions.height - (arrowDimensions.height/2);
            arrowDimensions.top = popupDimensions.height;
        }

        // Check if the popup should show up relative to the mouse
        if(opts.isRelativeToMouse){
            if(diff < 0){
                popupDimensions.right = SCREEN_PADDING;
                popupDimensions.left = "auto";
                // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
                arrowDimensions.left = mousePosition.x - (viewportDimensions.width - popupDimensions.width);
            }else{
                popupDimensions.left = mousePosition.x - 20;
                // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
                arrowDimensions.left = mousePosition.x - popupDimensions.left;
            }
        }else{
            if(diff < 0){
                popupDimensions.right = SCREEN_PADDING;
                popupDimensions.left = "auto";

                var popupRightEdge = viewportDimensions.width - popupDimensions.right;
                var popupLeftEdge = popupRightEdge - popupDimensions.width;

                //arrow's position must be relative to the popup's position and not of the screen.
                arrowDimensions.right = "auto";
                // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
                arrowDimensions.left = middleOfTrigger - popupLeftEdge - arrowDimensions.width/2;
            } else if(popupDimensions.width <= targetDimensions.width/2){
                // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
                arrowDimensions.left = popupDimensions.width/2;
                popupDimensions.left = middleOfTrigger - popupDimensions.width/2;
            }
        }
        return {
            gravity: displayAbove ? 's' : 'n',
            displayAbove: displayAbove,  // Replaced with gravity but remains for backward compatibility.
            popupCss: {
                left: popupDimensions.left,
                top: popupDimensions.top,
                right: popupDimensions.right
            },
            arrowCss: {
                left: arrowDimensions.left,
                top: arrowDimensions.top,
                right: arrowDimensions.right
            }
        };
    }


    AJS.InlineDialog.opts = {
        onTop: false,
        responseHandler: function(data, status, xhr) {
            //assume data is html
            return data;
        },
        closeOthers: true,
        isRelativeToMouse: false,
        addActiveClass: true, // if false, signifies that the triggers should not have the "active" class applied
        onHover: false,
        useLiveEvents: false,
        noBind: false,
        fadeTime: 100,
        persistent: false,
        hideDelay: 10000,
        showDelay: 0,
        width: 300,
        offsetX: 0,
        offsetY: 10,
        arrowOffsetX: 0,
        arrowOffsetY: 0,
        container: "body",
        cacheContent : true,
        displayShadow: true,
        autoWidth: false,
        gravity: 'n',
        closeOnTriggerClick: false,
        preHideCallback: function () { return true; },
        hideCallback: function(){}, // if defined, this method will be exected after the popup has been faded out.
        initCallback: function(){}, // A function called after the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
        upfrontCallback: function() {}, // A function called before the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
        /**
         * Returns an object with the following attributes:
         *      popupCss css attributes to apply on the popup element
         *      arrowCss css attributes to apply on the arrow element
         *
         * @param popup
         * @param targetPosition position of the target element
         * @param mousePosition current mouse position
         * @param opts options
         */
        calculatePositions: function (popup, targetPosition, mousePosition, opts) {
            opts = opts || {};
            var algorithm = opts.gravity === 'w'? calculateWestPositions : calculateNorthSouthPositions;
            return algorithm(popup, targetPosition, mousePosition, opts)
        },
        getArrowPath : function (positions) {
            if (positions.gravity === 's') {
                return "M0,8L8,16,16,8";
            } else {
                return "M0,8L8,0,16,8";
            }
        },
        getArrowAttributes: function () {
            return {
                fill : "#fff",
                stroke : "#ccc"
            };
        }
    };

    AJS.InlineDialog = AJS.deprecate.construct(AJS.InlineDialog, 'Inline dialog constructor', {
        alternativeName: 'inline dialog 2'
    });

    // Option deprecations
    var displayAboveDeprecationLogger = AJS.deprecate.getMessageLogger('displayAbove', '[remove version]', {alternativeName: 'gravity', extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'});
    var onTopDeprecationLogger = AJS.deprecate.getMessageLogger('onTop', '[remove version]', {alternativeName: 'gravity', extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'});
    var getArrowAttributesDeprecationLogger = AJS.deprecate.getMessageLogger('getArrowAttributes', '[remove version]', {extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-1362.'});
    var getArrowPathDeprecationLogger = AJS.deprecate.getMessageLogger('getArrowPath', '[remove version]', {extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-1362.'});
    var getArrowPathWithGravityDeprecationLogger = AJS.deprecate.getMessageLogger('getArrowPath does not support gravity', '[remove version]', {extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'});

})(AJS.$);
