//Self executing function so we can pass in jquery.
(function($) {
    AJS.responsiveheader = {};
    AJS.responsiveheader.setup = function() {
        var $headers = $('.aui-header');
        if (!$headers.length) {
            return;
        }

        $headers.each(function(index, element){
            processHeader($(element), index);
        });

        function processHeader($thisHeader, id){
            //HELPER FUNCTIONS
            //function that constructs the show more dropdown menu content
            function constructResponsiveDropdown(id) {
                var remaining;
                calculateAvailableWidth();
                if (availableWidth > totalWidth){
                    showAll(id);
                } else {
                    moreMenu.show();
                    remaining = availableWidth - moreMenuWidth;

                    // loop through menu items until no more remaining space
                    //i represents the index of the last item in the header
                    for (var i = 0; remaining >= 0; i++) {
                        remaining -= menuItems[i].itemWidth;
                    }
                    //Subtract one for fencepost
                    i = i-1;
                    //move everything after the last index into the show more dropdown
                    moveToResponsiveDropdown(i, id);

                    //move everything between the previous index and the current index out of the dropdown
                    moveOutOfResponsiveDropdown(i, previousIndex, id);

                    //return the index of the last last item in the header so we can remember it for next time
                    return i;
                }
            }

            //calculate widths based on the current state of the page
            function calculateAvailableWidth(){
                // if there is no secondary nav, use the right of the screen as the boundary instead
                var secondaryNavLeft = secondaryNav.length !== 0 ? secondaryNav.offset().left : $(window).width();

                //the right most side of the primary nav, this is assumed to exists if this code is running
                var primaryNavRight = applicationLogo.offset().left + applicationLogo.outerWidth(true) + primaryButtonsWidth;
                availableWidth = secondaryNavLeft - primaryNavRight;
            }

            //creates the trigger and content elements for the show more dropdown
            function createResponsiveDropdownTrigger(id){
                //create the trigger
                var $responsiveTrigger = $("<li>" + aui.dropdown2.trigger({
                    menu: {id: "aui-responsive-header-dropdown-content-" + id},
                    text: AJS.I18n.getText('aui.words.more'),
                    extraAttributes: {
                        href: "#"
                    },
                    id: "aui-responsive-header-dropdown-trigger-" + id
                }) + "</li>");

                //create the dropdown content container
                $responsiveTrigger.append(aui.dropdown2.contents({
                    id: "aui-responsive-header-dropdown-content-" + id,
                    extraClasses: "aui-style-default",
                    content: aui.dropdown2.section({content: "<ul id='aui-responsive-header-dropdown-list-" + id + "'></ul>"})
                }));

                //detect if buttons exist
                if (primaryButtonsWidth === 0) {
                    $responsiveTrigger.appendTo(inHeader(".aui-nav"));
                } else {
                    $responsiveTrigger.insertBefore(inHeader(".aui-nav > li > .aui-button")
                        .first().parent());
                }
                moreMenu = $responsiveTrigger;
                moreMenuWidth = moreMenu.outerWidth(true);
            }

            //function that handles moving items out of the show more menu into the app header
            function moveOutOfResponsiveDropdown (index, previousIndex, id) {
                if (index < 0 || previousIndex < 0 || index === previousIndex) {
                    return;
                }
                var $responsiveTrigger = $("#aui-responsive-header-dropdown-trigger-" + id);
                var $responsiveTriggerItem = $responsiveTrigger.parent();
                var current;
                var currentItem;

                if($responsiveTrigger.hasClass("active")) {
                    $responsiveTrigger.trigger("aui-button-invoke");
                }
                var menuItemElementsLength = inHeader(".aui-nav > li > a:not(.aui-button):not(#aui-responsive-header-dropdown-trigger-" + id + ")").length;
                while (index > previousIndex) {
                    current = menuItems[previousIndex];
                    //Make sure things exist before accessing them.
                    if (current && current.itemElement) {
                        currentItem = current.itemElement;
                        if (menuItemElementsLength === 0) {
                            //this path should only run once when there are no menu items left in the header
                            currentItem.prependTo(inHeader(".aui-nav"));
                        } else {
                            currentItem.insertBefore($responsiveTriggerItem);
                        }
                        currentItem.children("a")
                            .removeClass("aui-dropdown2-sub-trigger active");
                        previousIndex = previousIndex + 1;
                        menuItemElementsLength = menuItemElementsLength + 1;
                    }
                }
            }

            //function that handles moving itesm into the show more menu
            function moveToResponsiveDropdown(index, id) {
                if (index < 0) {
                    return;
                }
                var dropdownContainer = $("#aui-responsive-header-dropdown-list-" + id);

                for (var i = index; i < menuItems.length; i++) {
                    menuItems[i].itemElement.appendTo(dropdownContainer);
                    var $itemTrigger = menuItems[i].itemElement.children("a");
                    if ($itemTrigger.hasClass("aui-dropdown2-trigger")) {
                        $itemTrigger.addClass("aui-dropdown2-sub-trigger");
                    }
                }
            }

            //function that handles show everything
            function showAll(id) {
                moreMenu.hide();
                moveOutOfResponsiveDropdown(menuItems.length, previousIndex, id);
            }

            var secondaryNav = $thisHeader.find(".aui-header-secondary .aui-nav").first();
            $('.aui-header').attr('data-aui-responsive', 'true');
            var menuItems = [];
            var availableWidth = 0;
            var totalWidth = 0;
            var moreMenu;
            var previousIndex;
            var applicationLogo = $thisHeader.find("#logo");
            var moreMenuWidth = 0;
            //to cache the selector and give .find convenience
            var inHeader = (function(){
                var header = $thisHeader.find(".aui-header-primary").first();
                return function(selector){
                    return header.find(selector);
                };
            })();

            var primaryButtonsWidth = 0;
            inHeader(".aui-button").parent().each(function(index, element){
                primaryButtonsWidth += $(element).outerWidth(true);
            });
            //remember the widths of all the menu items
            inHeader(".aui-nav > li > a:not(.aui-button)").each(function(index, element){
                var $element = $(element).parent();
                var itemWidth = $element.outerWidth(true);
                menuItems.push({itemElement: $element, itemWidth: itemWidth});
                totalWidth += itemWidth;
            });

            previousIndex = menuItems.length;

            // attach resize handler
            $(window).resize(function(){
                previousIndex = constructResponsiveDropdown(id);
            });

            //create the elements for the show more menu

            createResponsiveDropdownTrigger(id);

            //So that the header logo doesn't mess things up. (size is unknown before the image loads)
            var $logoImg = applicationLogo.find("img");
            if($logoImg.length !== 0) {
                $logoImg.attr("data-aui-responsive-header-index", id);
                $logoImg.load(function(e){
                    previousIndex = constructResponsiveDropdown(id);
                });
            }

            //construct the show more dropdown
            previousIndex = constructResponsiveDropdown(id);

            //show the aui nav (hidden via css on load)
            inHeader('.aui-nav').css("width", "auto");
        }
    };
})(AJS.$);

AJS.$(AJS.responsiveheader.setup);