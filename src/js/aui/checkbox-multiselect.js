/**
 * Enhances a <select multiple> to be a button & dropdown combination. The button lists the selected <option>s. Clicking
 * the button reveals dropdown that has a list of checkboxes. Checking/Unchecking update the button's value and the state
 * of the corresponding <option>.
 *
 * To use simple add the attr aui-checkbox-multiselect to a <select multiple>.
 */
define(function () {

    var skate = window.skate;
    var $ = window.jQuery;

    /**
     * Set of soy templates
     */
    var templates = {
        dropdown: function (items) {

            function createSection() {
                return $('<div class="aui-dropdown2-section">');
            }

            // clear items section
            var $clearItemsSection = createSection();

            $('<button />').attr({
                'type': 'button',
                'data-aui-checkbox-multiselect-clear': '',
                'class': 'aui-button aui-button-link'
            })
                .text(AJS.I18n.getText('aui.checkboxmultiselect.clear.selected'))
                .appendTo($clearItemsSection);

            // list of items
            var $section = createSection();
            var $itemList = $('<ul />').appendTo($section);

            $.each(items, function (idx, item) {

                var $li = $('<li />').attr({
                    'class': item.styleClass || ''
                }).appendTo($itemList);

                var $a =  $('<a />')
                    .text(item.label)
                    .attr('data-value', item.value)
                    .addClass('aui-dropdown2-checkbox aui-dropdown2-interactive')
                    .appendTo($li);

                if (item.icon) {
                    $('<span />')
                        .addClass('aui-icon')
                        .css("backgroundImage", 'url(' + item.icon + ')")')
                        .appendTo($a);
                }

                if (item.selected) {
                    $a.addClass('aui-dropdown2-checked')
                }
            });

            return $('<div />')
                .append($clearItemsSection)
                .append($section)
                .html();
        },
        furniture: function (name, optionsHtml) {

            var dropdownId = name + '-dropdown';

            var $select = $('<select />').attr({
                'name': name,
                'multiple': 'multiple'
            }).html(optionsHtml);

            var $dropdown = $('<div>')
                .attr({
                    'id': dropdownId,
                    'class': 'aui-checkbox-multiselect-dropdown aui-dropdown2 aui-style-default'
                });

            var $button = $('<button />')
                .attr({
                    'class': 'aui-checkbox-multiselect-btn aui-button aui-dropdown2-trigger',
                    'type': 'button',
                    'aria-owns': dropdownId,
                    'aria-haspopup': true
                });

            return $('<div />')
                .append($select)
                .append($button)
                .append($dropdown)
                .html();

        }
    };

    /**
     * Handles when user clicks an item in the dropdown list. Either selects or unselects the corresponding
     * option in the <select>.
     * @private
     */
    function handleDropdownSelection(e) {
        var $a = $(e.target);
        var value = $a.attr('data-value');
        updateOption(this, value, $a.hasClass('aui-dropdown2-checked'));
    }

    /**
     * Selects or unselects the <option> corresponding the given value.
     * @private
     * @param component - Checkbox MultiSelect web component
     * @param value - value of option to update
     * @param {Boolean} selected - select or unselect it.
     */
    function updateOption(component, value, selected) {
        var $toUpdate = component.$select.find('option').filter(function () {
            var $this = $(this);
            return $this.attr('value') === value && $this.prop('selected') != selected;
        });
        if ($toUpdate.length) {
            $toUpdate.prop('selected', selected);
            component.$select.trigger('change');
        }
    }

    /**
     * Enables 'clear all' button if there are any selected <option>s, otherwise disables it.
     * @private
     */
    function updateClearAll(component) {
        component.$dropdown.find('[data-aui-checkbox-multiselect-clear]').prop('disabled', function () {
            return getSelectedDescriptors(component).length < 1;
        })
    }

    /**
     * Gets button title used for tipsy. Is blank when dropdown is open so we don't get tipsy hanging over options.
     * @private
     * @param component
     * @returns {string}
     */
    function getButtonTitle(component) {
        return component.$dropdown.is('[aria-hidden=false]') ? '' : getSelectedLabels(component).join(', ');
    }

    /**
     * Converts a jQuery collection of <option> elements into an object that describes them.
     * @param {jQuery} $options
     * @returns {Array<Object>}
     * @private
     */
    function mapOptionDescriptors($options) {
        return $options.map(function () {
            var $option = $(this);
            return {
                value: $option.val(),
                label: $option.text(),
                icon: $option.data('icon'),
                styleClass: $option.data('styleClass'),
                title: $option.attr('title'),
                disabled: $option.attr('disabled'),
                selected: $option.attr('selected')
            };
        });
    }

    /**
     * Gets label for when nothing is selected
     * @returns {string}
     * @private
     */
    function getImplicitAllLabel (component) {
        return $(component).data('allLabel') || 'All';
    }


    /**
     * Renders dropdown with list of items representing the selected or unselect state of the <option>s in <select>
     * @private
     */
    function renderDropdown(component) {
        component.$dropdown.html(templates.dropdown(getDescriptors(component)));
        updateClearAll(component);
    }

    /**
     * Renders button with the selected <option>'s innerText in a comma seperated list. If nothing is selected 'All'
     * is displayed.
     * @private
     */
    function renderButton(component) {
        var selectedLabels = getSelectedLabels(component);
        var label = isImplicitAll(component) ? getImplicitAllLabel(component) : selectedLabels.join(', ');
        component.$btn.text(label);
    }

    /**
     * Gets descriptor for selected options, the descriptor is an object that contains meta information about
     * the option, such as value, label, icon etc.
     * @private
     * @returns Array<Object>
     */
    function getDescriptors(component) {
        return mapOptionDescriptors(component.getOptions());
    }

    /**
     * Gets descriptor for selected options, the descriptor is an object that contains meta information about
     * the option, such as value, label, icon etc.
     * @private
     * @returns Array<Object>
     */
    function getSelectedDescriptors(component) {
        return mapOptionDescriptors(component.getSelectedOptions());
    }

    /**
     * Gets the innerText of the selected options
     * @private
     * @returns Array<String>
     */
    function getSelectedLabels(component) {
        return $.map(getSelectedDescriptors(component), function (descriptor) {
            return descriptor.label;
        });
    }

    /**
     * If nothing is selected, we take this to mean that everything is selected.
     * @returns Boolean
     */
    function isImplicitAll(component) {
        return getSelectedDescriptors(component).length === 0;
    }

    skate('aui-checkbox-multiselect', {
        type: skate.types.TAG,
        template: function (component) {
            var name = component.getAttribute("name") || AJS.id('aui-checkbox-multiselect-');
            component.innerHTML = templates.furniture(name, component.innerHTML);
        },
        ready: function (component) {
            component.$select = $("select", component)
                .change(function () {
                    renderButton(component);
                    updateClearAll(component);
                });

            component.$dropdown = $(".aui-checkbox-multiselect-dropdown", component)
                .on('aui-dropdown2-item-check', handleDropdownSelection.bind(component))
                .on('aui-dropdown2-item-uncheck', handleDropdownSelection.bind(component))
                .on('click', 'button[data-aui-checkbox-multiselect-clear]', component.deselectAllOptions.bind(component));

            component.$btn = $(".aui-checkbox-multiselect-btn", component)
                .tooltip({
                    title: function () {
                        return getButtonTitle(component);
                    }
                });

            renderButton(component);
            renderDropdown(component);
        },
        prototype: {

            /**
             * Gets all options regardless of selected or unselected
             * @returns {jQuery}
             */
            getOptions: function () {
                return this.$select.find('option');
            },

            /**
             * Gets all selected options
             * @returns {jQuery}
             */
            getSelectedOptions: function () {
                return this.$select.find('option:selected');
            },

            /**
             * Sets <option> elements matching given value to selected
             */
            selectOption: function (value) {
                updateOption(this, value, true);
            },

            /**
             * Sets <option> elements matching given value to unselected
             */
            unselectOption: function (value) {
                updateOption(this, value, false);
            },

            /**
             * Gets value of <select>
             * @returns Array
             */
            getValue: function () {
                return this.$select.val();
            },

            /**
             * Unchecks all items in the dropdown and in the <select>
             */
            deselectAllOptions: function () {
                this.$select.val([]).trigger('change');
                this.$dropdown.find('.aui-dropdown2-checked,.checked').removeClass('aui-dropdown2-checked checked');
            },
            /**
             * Adds an option to the <select>
             * @param descriptor
             */
            addOption: function (descriptor) {
                $("<option />").attr({
                    value: descriptor.value,
                    icon: descriptor.icon,
                    disabled: descriptor.disabled,
                    selected: descriptor.selected,
                    title: descriptor.title
                })
                    .text(descriptor.label)
                    .appendTo(this.$select);
                renderButton(this);
                renderDropdown(this);
            },
            /**
             * Removes options matching value from <select>
             * @param value
             */
            removeOption: function (value) {
                this.$select.find("[value='" + value + "']").remove();
                renderButton(this);
                renderDropdown(this);
            }
        }
    });

});