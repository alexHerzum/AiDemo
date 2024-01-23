(function ($) {

    /**
     * An abstract class that gives the required behaviour for RestfulTable rows.
     * Extend this class and pass it as the {views.row} property of the options passed to AJS.RestfulTable in construction.
     *
     * @class Row
     * @namespace AJS.RestfulTable
     */
    AJS.RestfulTable.Row = Backbone.View.extend({

        // Static Const
        tagName: "tr",

        // delegate events
        events: {
            "click .aui-restfultable-editable" : "edit"
        },

        /**
         * @constructor
         * @param {object} options
         */
        initialize: function (options) {

            var instance = this;

            options = options || {};

            // faster lookup
            this._event = AJS.RestfulTable.Events;
            this.classNames = AJS.RestfulTable.ClassNames;
            this.dataKeys = AJS.RestfulTable.DataKeys;

            this.columns = options.columns;
            this.allowEdit = options.allowEdit;
            this.allowDelete = options.allowDelete;

            if (!this.events["click .aui-restfultable-editable"]) {
                throw new Error("It appears you have overridden the events property. To add events you will need to use"
                        + "a work around. https://github.com/documentcloud/backbone/issues/244");
            }
            this.index = options.index || 0;
            this.deleteConfirmation = options.deleteConfirmation;
            this.allowReorder = options.allowReorder;

            this.$el = $(this.el);

            this.bind(this._event.CANCEL, function () {
                this.disabled = true;
            })
                    .bind(this._event.FOCUS, function (field) {
                        this.focus(field);
                    })
                    .bind(this._event.BLUR, function () {
                        this.unfocus();
                    })
                    .bind(this._event.MODAL, function () {
                        this.$el.addClass(this.classNames.ACTIVE);
                    })
                    .bind(this._event.MODELESS, function () {
                        this.$el.removeClass(this.classNames.ACTIVE);
                    });
        },

        /**
         * Renders drag handle
         * @return jQuery
         */
        renderDragHandle: function () {
            return '<span class="' + this.classNames.DRAG_HANDLE + '"></span></td>';

        },

        /**
         * Renders default cell contents
         *
         * @param data
         * @return {undefiend, String}
         */
        defaultColumnRenderer: function (data) {
            if (data.value) {
                return document.createTextNode(data.value.toString());
            }
        },

        /**
         * Save changed attributes back to server and re-render
         *
         * @param attr
         * @return {AJS.RestfulTable.Row}
         */
        sync: function (attr) {

            this.model.addExpand(attr);

            var instance = this;

            this.showLoading();

            this.model.save(attr, {
                success: function () {
                    instance.hideLoading().render();
                    instance.trigger(instance._event.UPDATED);
                },
                error: function () {
                    instance.hideLoading();
                }
            });

            return this;
        },

        /**
         * Get model from server and re-render
         *
         * @return {AJS.RestfulTable.Row}
         */
        refresh: function (success, error) {

            var instance = this;

            this.showLoading();

            this.model.fetch({
                success: function () {
                    instance.hideLoading().render();
                    if (success) {
                        success.apply(this, arguments);
                    }
                },
                error: function () {
                    instance.hideLoading();
                    if (error) {
                        error.apply(this, arguments);
                    }
                }
            });

            return this;
        },

        /**
         * Returns true if row has focused class
         *
         * @return Boolean
         */
        hasFocus: function () {
            return this.$el.hasClass(this.classNames.FOCUSED);
        },

        /**
         * Adds focus class (Item has been recently updated)
         *
         * @return AJS.RestfulTable.Row
         */
        focus: function () {
            $(this.el).addClass(this.classNames.FOCUSED);
            return this;
        },

        /**
         * Removes focus class
         *
         * @return AJS.RestfulTable.Row
         */
        unfocus: function () {
            $(this.el).removeClass(this.classNames.FOCUSED);
            return this;

        },

        /**
         * Adds loading class (to show server activity)
         *
         * @return AJS.RestfulTable.Row
         */
        showLoading: function () {
            this.$el.addClass(this.classNames.LOADING);
            return this;
        },

        /**
         * Hides loading class (to show server activity)
         *
         * @return AJS.RestfulTable.Row
         */
        hideLoading: function () {
            this.$el.removeClass(this.classNames.LOADING);
            return this;
        },

        /**
         * Switches row into edit mode
         *
         * @param e
         */
        edit: function (e) {
            var field;
            if ($(e.target).is("." + this.classNames.EDITABLE)) {
                field = $(e.target).attr("data-field-name");
            } else {
                field = $(e.target).closest("." + this.classNames.EDITABLE).attr("data-field-name");
            }
            this.trigger(this._event.ROW_EDIT, field);
            return this;
        },

        /**
         * Can be overriden to add custom options
         *
         */
        renderOperations: function () {
            var instance = this;
            if (this.allowDelete !== false) {
                return $("<a href='#' class='aui-button' />")
                        .addClass(this.classNames.DELETE)
                        .text(AJS.I18n.getText("aui.words.delete")).click(function (e) {
                            e.preventDefault();
                            instance.destroy();
                        });
            }
        },

        /**
         * Removes entry from table
         */
        destroy: function () {
            if (this.deleteConfirmation) {
                var popup = AJS.popup(400, 200, "delete-entity-" + this.model.get("id"));
                popup.element.html(this.deleteConfirmation(this.model.toJSON()));
                popup.show();
                popup.element.find(".cancel").click(function () {
                    popup.hide();
                });
                popup.element.find("form").submit(_.bind(function (e) {
                    popup.hide();
                    this.model.destroy();
                    e.preventDefault();
                }, this));
            } else {
                this.model.destroy();
            }

        },

        /**
         * Renders a generic edit row. You probably want to override this in a sub class.
         *
         * @return AJS.RestfulTable.Row
         */
        render: function  () {

            var instance = this,
                    renderData = this.model.toJSON(),
                    $opsCell = $("<td class='aui-restfultable-operations' />").append(this.renderOperations({}, renderData)),
                    $throbberCell = $("<td class='aui-restfultable-status' />").append(AJS.RestfulTable.throbber());

            // restore state
            this.$el
                    .removeClass(this.classNames.DISABLED + " " + this.classNames.FOCUSED + " " + this.classNames.LOADING + " " + this.classNames.EDIT_ROW)
                    .addClass(this.classNames.READ_ONLY)
                    .empty();


            if (this.allowReorder) {
                $('<td  class="' + this.classNames.ORDER + '" />').append(this.renderDragHandle()).appendTo(instance.$el);
            }

            this.$el.attr("data-id", this.model.id); // helper for webdriver testing

            $.each(this.columns, function (i, column) {

                var contents,
                        $cell = $("<td />"),
                        value = renderData[column.id],
                        fieldName = column.fieldName || column.id,
                        args = [{name: fieldName, value: value, allowEdit: column.allowEdit}, renderData, instance.model];

                if (value) {
                    instance.$el.attr("data-" + column.id, value); // helper for webdriver testing

                }

                if (column.readView) {
                    contents = new column.readView({
                        model: instance.model
                    }).render(args[0]);
                } else {
                    contents = instance.defaultColumnRenderer.apply(instance, args);
                }

                if (instance.allowEdit !== false && column.allowEdit !== false) {
                    var $editableRegion = $("<span />")
                            .addClass(instance.classNames.EDITABLE)
                            .append(aui.icons.icon({useIconFont: true, icon: 'edit'}))
                            .append(contents)
                            .attr("data-field-name", fieldName);

                    $cell  = $("<td />").append($editableRegion).appendTo(instance.$el);

                    if (!contents || $.trim(contents) == "") {
                        $cell.addClass(instance.classNames.NO_VALUE);
                        $editableRegion.html($("<em />").text(this.emptyText || AJS.I18n.getText("aui.enter.value")));
                    }

                } else {
                    $cell.append(contents);
                }

                if (column.styleClass) {
                    $cell.addClass(column.styleClass);
                }

                $cell.appendTo(instance.$el);
            });

            this.$el
                    .append($opsCell)
                    .append($throbberCell)
                    .addClass(this.classNames.ROW + " " + this.classNames.READ_ONLY);

            this.trigger(this._event.RENDER, this.$el, renderData);
            this.$el.trigger(this._event.CONTENT_REFRESHED, [this.$el]);
            return this;
        }
    });

})(AJS.$);