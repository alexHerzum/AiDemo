(function ($) {

    /**
     * A table whose entries/rows can be retrieved, added and updated via REST (CRUD).
     * It uses backbone.js to sync the table's state back to the server, avoiding page refreshes.
     *
     * @class RestfulTable
     */
    AJS.RestfulTable = Backbone.View.extend({

        /**
         * @constructor
         * @param {!Object} options
         * ... {!Object} resources
         * ... ... {(string|function(function(Array.<Object>)))} all - URL of REST resource OR function that retrieves all entities.
         * ... ... {string} self - URL of REST resource to sync a single entities state (CRUD).
         * ... {!(selector|Element|jQuery)} el - Table element or selector of the table element to populate.
         * ... {!Array.<Object>} columns - Which properties of the entities to render. The id of a column maps to the property of an entity.
         * ... {Object} views
         * ... ... {AJS.RestfulTable.EditRow} editRow - Backbone view that renders the edit & create row. Your view MUST extend AJS.RestfulTable.EditRow.
         * ... ... {AJS.RestfulTable.Row} row - Backbone view that renders the readonly row. Your view MUST extend AJS.RestfulTable.Row.
         * ... {boolean} allowEdit - Is the table editable. If true, clicking row will switch it to edit state. Default true.
         * ... {boolean} allowDelete - Can entries be removed from the table, default true.
         * ... {boolean} allowCreate - Can new entries be added to the table, default true.
         * ... {boolean} allowReorder - Can we drag rows to reorder them, default false.
         * ... {boolean} autoFocus - Automatically set focus to first field on init, default false.
         * ... {boolean} reverseOrder - Reverse the order of rows, default false.
         * ... {boolean} silent - Do not trigger a "refresh" event on sort, default false.
         * ... {String} id - The id for the table. This id will be used to fire events specific to this instance.
         * ... {string} createPosition - If set to "bottom", place the create form at the bottom of the table instead of the top.
         * ... {string} addPosition - If set to "bottom", add new rows at the bottom of the table instead of the top. If undefined, createPosition will be used to define where to add the new row.
         * ... {string} noEntriesMsg - Text to display under the table header if it is empty, default empty.
         * ... {string} loadingMsg - Text/HTML to display while loading, default "Loading".
         * ... {string} submitAccessKey - Access key for submitting.
         * ... {string} cancelAccessKey - Access key for canceling.
         * ... {function(Object): (string|function(number, string): string)} deleteConfirmation - HTML to display in popup to confirm deletion.
         * ... {function(string): (selector|jQuery|Element)} fieldFocusSelector - Element to focus on given a name.
         * ... {AJS.RestfulTable.EntryModel} model - Backbone model representing a row, default AJS.RestfulTable.EntryModel.
         * ... {Backbone.Collection} Collection - Backbone collection representing the entire table, default Backbone.Collection.
         */
        initialize: function (options) {

            var instance = this;


            // combine default and user options
            instance.options = $.extend(true, instance._getDefaultOptions(options), options);

            // Prefix events for this instance with this id.
            instance.id = this.options.id;

            // faster lookup
            instance._event = AJS.RestfulTable.Events;
            instance.classNames = AJS.RestfulTable.ClassNames;
            instance.dataKeys = AJS.RestfulTable.DataKeys;

            // shortcuts to popular elements
            this.$table = $(options.el)
                    .addClass(this.classNames.RESTFUL_TABLE)
                    .addClass(this.classNames.ALLOW_HOVER)
                    .addClass("aui")
                    .addClass(instance.classNames.LOADING);

            this.$table.wrapAll("<form class='aui' action='#' />");

            this.$thead = $("<thead/>");
            this.$theadRow = $("<tr />").appendTo(this.$thead);
            this.$tbody = $("<tbody/>");

            if (!this.$table.length) {
                throw new Error("AJS.RestfulTable: Init failed! The table you have specified [" + this.$table.selector + "] cannot be found.");
            }

            if (!this.options.columns) {
                throw new Error("AJS.RestfulTable: Init failed! You haven't provided any columns to render.");
            }

            // Let user know the table is loading
            this.showGlobalLoading();

            $.each(this.options.columns, function (i, column) {
                var header = $.isFunction(column.header) ? column.header() : column.header;
                if (typeof header === "undefined") {
                    AJS.warn("You have not specified [header] for column [" + column.id + "]. Using id for now...");
                    header = column.id;
                }

                instance.$theadRow.append("<th>" + header + "</th>");
            });

            // columns for submit buttons and loading indicator used when editing
            instance.$theadRow.append("<th></th><th></th>");

            // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
            this._models = this._createCollection();

            // shortcut to the class we use to create rows
            this._rowClass = this.options.views.row;

            this.editRows = []; // keep track of rows that are being edited concurrently

            this.$table.closest("form").submit(function (e) {
                if (instance.focusedRow) {
                    // Delegates saving of row. See AJS.RestfulTable.EditRow.submit
                    instance.focusedRow.trigger(instance._event.SAVE);
                }
                e.preventDefault();
            });

            if (this.options.allowReorder) {

                // Add allowance for another cell to the <thead>
                this.$theadRow.prepend("<th />");

                // Allow drag and drop reordering of rows
                this.$tbody.sortable({
                    handle: "." +this.classNames.DRAG_HANDLE,
                    helper: function(e, elt) {
                        var helper = $("<div/>").attr("class", elt.attr("class")).addClass(instance.classNames.MOVEABLE);
                        elt.children().each(function (i) {
                            var $td = $(this);

                            // .offsetWidth/.outerWidth() is broken in webkit for tables, so we do .clientWidth + borders
                            // Need to coerce the border-left-width to an in because IE - http://bugs.jquery.com/ticket/10855
                            var borderLeft = parseInt(0 + $td.css("border-left-width"), 10);
                            var borderRight = parseInt(0 + $td.css("border-right-width"), 10);
                            var width = $td[0].clientWidth + borderLeft + borderRight;

                            helper.append($("<div/>").html($td.html()).attr("class", $td.attr("class")).width(width));
                        });

                        helper = $("<div class='aui-restfultable-readonly'/>").append(helper); // Basically just to get the styles.
                        helper.css({left: elt.offset().left}); // To align with the other table rows, since we've locked scrolling on x.
                        helper.appendTo(document.body);

                        return helper;
                    },
                    start: function (event, ui) {
                        var cachedHeight = ui.helper[0].clientHeight;
                        var $this = ui.placeholder.find("td");

                        // Make sure that when we start dragging widths do not change
                        ui.item
                                .addClass(instance.classNames.MOVEABLE)
                                .children().each(function (i) {
                                    $(this).width($this.eq(i).width());
                                });

                        // Create a <td> to add to the placeholder <tr> to inherit CSS styles.
                        var td = '<td colspan="' + instance.getColumnCount() + '">&nbsp;</td>';

                        ui.placeholder.html(td).css({
                            height: cachedHeight,
                            visibility: 'visible'
                        });

                        // Stop hover effects etc from occuring as we move the mouse (while dragging) over other rows
                        instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODAL);
                    },
                    stop: function (event, ui) {
                        if (AJS.$(ui.item[0]).is(":visible")) {
                            ui.item
                                    .removeClass(instance.classNames.MOVEABLE)
                                    .children().attr("style", "");

                            ui.placeholder.removeClass(instance.classNames.ROW);

                            // Return table to a normal state
                            instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODELESS);
                        }
                    },
                    update: function (event, ui) {

                        var nextModel,
                                nextRow,
                                data = {},
                                row = instance.getRowFromElement(ui.item[0]);

                        if (row) {

                            if (instance.options.reverseOrder) {
                                // Everything is backwards here because on the client we are in reverse order.
                                nextRow = ui.item.next();
                                if (!nextRow.length) {
                                    data.position = "First";
                                } else {
                                    nextModel = instance.getRowFromElement(nextRow).model;
                                    data.after = nextModel.url();
                                }
                            } else {
                                nextRow = ui.item.prev();
                                if (!nextRow.length) {
                                    data.position = "First";
                                } else {
                                    nextModel = instance.getRowFromElement(nextRow).model;
                                    data.after = nextModel.url();
                                }
                            }

                            $.ajax({
                                url: row.model.url() + "/move",
                                type: "POST",
                                dataType: "json",
                                contentType: "application/json",
                                data: JSON.stringify(data),
                                complete: function () {
                                    // hides loading indicator (spinner)
                                    row.hideLoading();
                                },
                                success: function (xhr) {
                                    AJS.triggerEvtForInst(instance._event.REORDER_SUCCESS, instance, [xhr]);
                                },
                                error: function (xhr) {
                                    var responseData = $.parseJSON(xhr.responseText || xhr.data);
                                    AJS.triggerEvtForInst(instance._event.SERVER_ERROR, instance, [responseData, xhr, this]);
                                }
                            });

                            // shows loading indicator (spinner)
                            row.showLoading();
                        }
                    },
                    axis: "y",
                    delay: 0,
                    containment: "document",
                    cursor: "move",
                    scroll: true,
                    zIndex: 8000
                });

                // Prevent text selection while reordering.
                this.$tbody.bind("selectstart mousedown", function (event) {
                    return !$(event.target).is("." + instance.classNames.DRAG_HANDLE);
                });
            }


            if (this.options.allowCreate !== false) {

                // Create row responsible for adding new entries ...
                this._createRow = new this.options.views.editRow({
                    columns: this.options.columns,
                    isCreateRow: true,
                    model: this.options.model.extend({
                        url: function () {
                            return instance.options.resources.self;
                        }
                    }),
                    cancelAccessKey: this.options.cancelAccessKey,
                    submitAccessKey: this.options.submitAccessKey,
                    allowReorder: this.options.allowReorder,
                    fieldFocusSelector: this.options.fieldFocusSelector
                })
                        .bind(this._event.CREATED, function (values) {
                            if ((instance.options.addPosition == undefined && instance.options.createPosition === "bottom")
                                || instance.options.addPosition === "bottom") {
                                instance.addRow(values);
                            } else {
                                instance.addRow(values, 0);
                            }
                        })
                        .bind(this._event.VALIDATION_ERROR, function () {
                            this.trigger(instance._event.FOCUS);
                        })
                        .render({
                            errors: {},
                            values: {}
                        });

                // ... and appends it as the first row
                this.$create = $('<tbody class="' + this.classNames.CREATE + '" />')
                        .append(this._createRow.el);

                // Manage which row has focus
                this._applyFocusCoordinator(this._createRow);

                // focus create row
                this._createRow.trigger(this._event.FOCUS);
            }

            // when a model is removed from the collection, remove it from the viewport also
            this._models.bind("remove", function (model) {
                $.each(instance.getRows(), function (i, row) {
                    if (row.model === model) {
                        if (row.hasFocus() && instance._createRow) {
                            instance._createRow.trigger(instance._event.FOCUS);
                        }
                        instance.removeRow(row);
                    }
                });
            });

            if ($.isFunction(this.options.resources.all)) {
                this.options.resources.all(function (entries) {
                    instance.populate(entries);
                });
            } else {
                $.get(this.options.resources.all, function (entries) {
                    instance.populate(entries);
                });
            }
        },

        _createCollection: function() {
            var instance = this;

            // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
            var RowsAwareCollection = this.options.Collection.extend({
                // Force the collection to re-sort itself. You don't need to call this under normal
                // circumstances, as the set will maintain sort order as each item is added.
                sort:function (options) {
                    options || (options = {});
                    if (!this.comparator) {
                        throw new Error('Cannot sort a set without a comparator');
                    }
                    this.tableRows = instance.getRows();
                    this.models = this.sortBy(this.comparator);
                    this.tableRows = undefined;
                    if (!options.silent) {
                        this.trigger('refresh', this, options);
                    }
                    return this;
                },
                remove:function (models, options) {
                    this.tableRows = instance.getRows();
                    Backbone.Collection.prototype.remove.apply(this, arguments);
                    this.tableRows = undefined;
                    return this;
                }
            });

            return new RowsAwareCollection([], {
                comparator:function (row) {
                    // sort models in collection based on dom ordering
                    var index;
                    $.each(this.tableRows !== undefined ? this.tableRows : instance.getRows(), function (i) {
                        if (this.model.id === row.id) {
                            index = i;
                            return false;
                        }
                    });
                    return index;
                }
            });
        },

        /**
         * Refreshes table with entries
         *
         * @param entries
         */
        populate: function (entries) {

            if (this.options.reverseOrder) {
                entries.reverse();
            }

            this.hideGlobalLoading();
            if (entries && entries.length) {
                // Empty the models collection
                this._models.reset([], { silent: true });
                // Add all the entries to collection and render them
                this.renderRows(entries);
                // show message to user if we have no entries
                if (this.isEmpty()) {
                    this.showNoEntriesMsg();
                }
            } else {
                this.showNoEntriesMsg();
            }

            // Ok, lets let everyone know that we are done...
            this.$table
                    .append(this.$thead);

            if (this.options.createPosition === "bottom") {
                this.$table.append(this.$tbody)
                        .append(this.$create);
            } else {
                this.$table
                        .append(this.$create)
                        .append(this.$tbody);
            }

            this.$table.removeClass(this.classNames.LOADING)
                    .trigger(this._event.INITIALIZED, [this]);

            AJS.triggerEvtForInst(this._event.INITIALIZED, this, [this]);

            if (this.options.autoFocus) {
                this.$table.find(":input:text:first").focus(); // set focus to first field
            }
        },

        /**
         * Shows loading indicator and text
         *
         * @return {AJS.RestfulTable}
         */
        showGlobalLoading: function () {

            if (!this.$loading) {
                this.$loading =  $('<div class="aui-restfultable-init">' + AJS.RestfulTable.throbber() +
                        '<span class="aui-restfultable-loading">' + this.options.loadingMsg + '</span></div>');
            }
            if (!this.$loading.is(":visible")) {
                this.$loading.insertAfter(this.$table);
            }

            return this;
        },

        /**
         * Hides loading indicator and text
         * @return {AJS.RestfulTable}
         */
        hideGlobalLoading: function () {
            if (this.$loading) {
                this.$loading.remove();
            }
            return this;
        },


        /**
         * Adds row to collection and renders it
         *
         * @param {Object} values
         * @param {number} index
         * @return {AJS.RestfulTable}
         */
        addRow: function (values, index) {

            var view,
                    model;

            if (!values.id) {
                throw new Error("AJS.RestfulTable.addRow: to add a row values object must contain an id. "
                        + "Maybe you are not returning it from your restend point?"
                        + "Recieved:" + JSON.stringify(values));
            }

            model = new this.options.model(values);


            view = this._renderRow(model, index);

            this._models.add(model);
            this.removeNoEntriesMsg();

            // Let everyone know we added a row
            AJS.triggerEvtForInst(this._event.ROW_ADDED, this, [view, this]);
            return this;
        },

        /**
         * Provided a view, removes it from display and backbone collection
         *
         * @param row {AJS.RestfulTable.Row}
         */
        removeRow: function (row) {

            this._models.remove(row.model);
            row.remove();

            if (this.isEmpty()) {
                this.showNoEntriesMsg();
            }

            // Let everyone know we removed a row
            AJS.triggerEvtForInst(this._event.ROW_REMOVED, this, [row, this]);
        },

        /**
         * Is there any entries in the table
         *
         * @return {Boolean}
         */
        isEmpty: function () {
            return this._models.length === 0;
        },

        /**
         * Gets all models
         *
         * @return {Backbone.Collection}
         */
        getModels: function () {
            return this._models;
        },

        /**
         * Gets table body
         *
         * @return {jQuery}
         */
        getTable: function () {
            return this.$table;
        },

        /**
         * Gets table body
         *
         * @return {jQuery}
         */
        getTableBody: function () {
            return this.$tbody;
        },

        /**
         * Gets create Row
         *
         * @return {?AJS.RestfulTable.EditRow}
         */
        getCreateRow: function () {
            return this._createRow;
        },

        /**
         * Gets the number of table columns, accounting for the number of
         * additional columns added by RestfulTable itself
         * (such as the drag handle column, buttons and actions columns)
         *
         * @return {Number}
         */
        getColumnCount: function () {
            var staticFieldCount = 2; // accounts for the columns allocated to submit buttons and loading indicator
            if (this.allowReorder) {
                ++staticFieldCount;
            }
            return this.options.columns.length + staticFieldCount;
        },

        /**
         * Get the AJS.RestfulTable.Row that corresponds to the given <tr> element.
         *
         * @param {HTMLElement} tr
         * @return {?AJS.RestfulTable.Row}
         */
        getRowFromElement: function (tr) {
            return $(tr).data(this.dataKeys.ROW_VIEW);
        },

        /**
         * Shows message {options.noEntriesMsg} to the user if there are no entries
         *
         * @return {AJS.RestfulTable}
         */
        showNoEntriesMsg: function () {

            if (this.$noEntries) {
                this.$noEntries.remove();
            }

            this.$noEntries = $("<tr>")
                    .addClass(this.classNames.NO_ENTRIES)
                    .append($("<td>")
                    .attr("colspan", this.getColumnCount())
                    .text(this.options.noEntriesMsg)
            )
                    .appendTo(this.$tbody);

            return this;
        },

        /**
         * Removes message {options.noEntriesMsg} to the user if there ARE entries
         *
         * @return {AJS.RestfulTable}
         */
        removeNoEntriesMsg: function () {
            if (this.$noEntries && this._models.length > 0) {
                this.$noEntries.remove();
            }
            return this;
        },

        /**
         * Gets the AJS.RestfulTable.Row from their associated <tr> elements
         *
         * @return {Array<AJS.RestfulTable.Row>}
         */
        getRows: function () {

            var instance = this,
                    views = [];

            this.$tbody.find("." + this.classNames.READ_ONLY).each(function () {

                var $row = $(this),
                        view = $row.data(instance.dataKeys.ROW_VIEW);

                if (view) {
                    views.push(view);
                }
            });

            return views;
        },

        /**
         * Appends entry to end or specified index of table
         *
         * @param {AJS.RestfulTable.EntryModel} model
         * @param index
         * @return {jQuery}
         */
        _renderRow: function (model, index) {

            var instance = this,
                    $rows = this.$tbody.find("." + this.classNames.READ_ONLY),
                    $row,
                    view;

            view = new this._rowClass({
                model: model,
                columns: this.options.columns,
                allowEdit: this.options.allowEdit,
                allowDelete: this.options.allowDelete,
                allowReorder: this.options.allowReorder,
                deleteConfirmation: this.options.deleteConfirmation
            });

            this.removeNoEntriesMsg();

            view.bind(this._event.ROW_EDIT, function (field) {
                AJS.triggerEvtForInst(this._event.EDIT_ROW, {}, [this, instance]);
                instance.edit(this, field);
            });

            $row = view.render().$el;

            if (index !== -1) {

                if (typeof index === "number" && $rows.length !== 0) {
                    $row.insertBefore($rows[index]);
                } else {
                    this.$tbody.append($row);
                }
            }

            $row.data(this.dataKeys.ROW_VIEW, view);

            // deactivate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
            // or any interactions
            view.bind(this._event.MODAL, function () {
                instance.$table.removeClass(instance.classNames.ALLOW_HOVER);
                instance.$tbody.sortable("disable");
                $.each(instance.getRows(), function () {
                    if (!instance.isRowBeingEdited(this)) {
                        this.delegateEvents({}); // clear all events
                    }
                });
            });

            // activate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
            // or any interactions
            view.bind(this._event.MODELESS, function () {
                instance.$table.addClass(instance.classNames.ALLOW_HOVER);
                instance.$tbody.sortable("enable");
                $.each(instance.getRows(), function () {
                    if (!instance.isRowBeingEdited(this)) {
                        this.delegateEvents(); // rebind all events
                    }
                });
            });

            // ensure that when this row is focused no other are
            this._applyFocusCoordinator(view);

            this.trigger(this._event.ROW_INITIALIZED, view);

            return view;
        },

        /**
         * Returns if the row is edit mode or note
         *
         * @param row {AJS.RestfulTable.Row} - read-only row to check if being edited
         * @return {Boolean}
         */
        isRowBeingEdited: function (row) {

            var isBeingEdited = false;

            $.each(this.editRows, function () {
                if (this.el === row.el) {
                    isBeingEdited = true;
                    return false;
                }
            });

            return isBeingEdited;
        },

        /**
         * Ensures that when supplied view is focused no others are
         *
         * @param {Backbone.View} view
         * @return {AJS.RestfulTable}
         */
        _applyFocusCoordinator: function (view) {

            var instance = this;

            if (!view.hasFocusBound) {

                view.hasFocusBound = true;

                view.bind(this._event.FOCUS, function () {
                    if (instance.focusedRow && instance.focusedRow !== view) {
                        instance.focusedRow.trigger(instance._event.BLUR);
                    }
                    instance.focusedRow = view;
                    if (view instanceof AJS.RestfulTable.Row && instance._createRow) {
                        instance._createRow.enable();
                    }
                });
            }

            return this;
        },

        /**
         * Remove specified row from collection holding rows being concurrently edited
         *
         * @param {AJS.RestfulTable.EditRow} editView
         * @return {AJS.RestfulTable}
         */
        _removeEditRow: function (editView) {
            var index = $.inArray(editView, this.editRows);
            this.editRows.splice(index, 1);
            return this;
        },

        /**
         * Focuses last row still being edited or create row (if it exists)
         *
         * @return {AJS.RestfulTable}
         */
        _shiftFocusAfterEdit: function () {

            if (this.editRows.length > 0) {
                this.editRows[this.editRows.length-1].trigger(this._event.FOCUS);
            } else if (this._createRow) {
                this._createRow.trigger(this._event.FOCUS);
            }

            return this;
        },

        /**
         * Evaluate if we save row when we blur. We can only do this when there is one row being edited at a time, otherwise
         * it causes an infinite loop JRADEV-5325
         *
         * @return {boolean}
         */
        _saveEditRowOnBlur: function () {
            return this.editRows.length <= 1;
        },

        /**
         * Dismisses rows being edited concurrently that have no changes
         */
        dismissEditRows: function () {
            var instance = this;
            $.each(this.editRows, function () {
                if (!this.hasUpdates()) {
                    this.trigger(instance._event.FINISHED_EDITING);
                }
            });
        },

        /**
         * Converts readonly row to editable view
         *
         * @param {Backbone.View} row
         * @param {String} field - field name to focus
         * @return {Backbone.View} editRow
         */
        edit: function (row, field) {

            var instance = this,
                    editRow = new this.options.views.editRow({
                        el: row.el,
                        columns: this.options.columns,
                        isUpdateMode: true,
                        allowReorder: this.options.allowReorder,
                        fieldFocusSelector: this.options.fieldFocusSelector,
                        model: row.model,
                        cancelAccessKey: this.options.cancelAccessKey,
                        submitAccessKey: this.options.submitAccessKey
                    }),
                    values = row.model.toJSON();
            values.update = true;
            editRow.render({
                errors: {},
                update: true,
                values: values
            })
                    .bind(instance._event.UPDATED, function (model, focusUpdated) {
                        instance._removeEditRow (this);
                        this.unbind();
                        row.render().delegateEvents(); // render and rebind events
                        row.trigger(instance._event.UPDATED); // trigger blur fade out
                        if (focusUpdated !== false) {
                            instance._shiftFocusAfterEdit();
                        }
                    })
                    .bind(instance._event.VALIDATION_ERROR, function () {
                        this.trigger(instance._event.FOCUS);
                    })
                    .bind(instance._event.FINISHED_EDITING, function () {
                        instance._removeEditRow(this);
                        row.render().delegateEvents();
                        this.unbind();  // avoid any other updating, blurring, finished editing, cancel events being fired
                    })
                    .bind(instance._event.CANCEL, function () {
                        instance._removeEditRow(this);
                        this.unbind();  // avoid any other updating, blurring, finished editing, cancel events being fired
                        row.render().delegateEvents(); // render and rebind events
                        instance._shiftFocusAfterEdit();
                    })
                    .bind(instance._event.BLUR, function () {
                        instance.dismissEditRows(); // dismiss edit rows that have no changes
                        if (instance._saveEditRowOnBlur()) {
                            this.trigger(instance._event.SAVE, false);  // save row, which if successful will call the updated event above
                        }
                    });

            // Ensure that if focus is pulled to another row, we blur the edit row
            this._applyFocusCoordinator(editRow);

            // focus edit row, which has the flow on effect of blurring current focused row
            editRow.trigger(instance._event.FOCUS, field);

            // disables form fields
            if (instance._createRow) {
                instance._createRow.disable();
            }

            this.editRows.push(editRow);

            return editRow;
        },


        /**
         * Renders all specified rows
         *
         * @param rows {Array<Backbone.Model>} array of objects describing Backbone.Model's to render
         * @return {AJS.RestfulTable}
         */
        renderRows: function (rows) {
            var comparator = this._models.comparator, els = [];

            this._models.comparator = undefined; // disable temporarily, assume rows are sorted

            var models = _.map(rows, function(row) {
                var model = new this.options.model(row);
                els.push(this._renderRow(model, -1).el);
                return model;
            }, this);
            this._models.add(models, {silent:true});

            this._models.comparator = comparator;

            this.removeNoEntriesMsg();

            this.$tbody.append(els);

            return this;
        },

        /**
         * Gets default options
         *
         * @param {Object} options
         */
        _getDefaultOptions: function (options) {
            return {
                model: options.model || AJS.RestfulTable.EntryModel,
                allowEdit: true,
                views: {
                    editRow: AJS.RestfulTable.EditRow,
                    row: AJS.RestfulTable.Row
                },
                Collection: Backbone.Collection.extend({
                    url: options.resources.self,
                    model: options.model || AJS.RestfulTable.EntryModel
                }),
                allowReorder: false,
                fieldFocusSelector: function(name) {
                    return ":input[name=" + name + "], #" + name;
                },
                loadingMsg: options.loadingMsg || AJS.I18n.getText("aui.words.loading")
            };
        }

    });

    AJS.RestfulTable.throbber = function throbberHtml() {
        return '<span class="aui-restfultable-throbber"></span>';
    };

    AJS.RestfulTable.throbber = function throbberHtml() {
        return '<span class="aui-restfultable-throbber"></span>';
    };

    // jQuery data keys (http://api.jquery.com/jQuery.data/)
    AJS.RestfulTable.DataKeys = {
        ENABLED_SUBMIT: "enabledSubmit",
        ROW_VIEW: "RestfulTable_Row_View"
    };

    // CSS style classes. DON'T hard code
    AJS.RestfulTable.ClassNames = {
        NO_VALUE: "aui-restfultable-editable-no-value",
        NO_ENTRIES: "aui-restfultable-no-entires",
        RESTFUL_TABLE: "aui-restfultable",
        ROW: "aui-restfultable-row",
        READ_ONLY: "aui-restfultable-readonly",
        ACTIVE: "aui-restfultable-active",
        ALLOW_HOVER: "aui-restfultable-allowhover",
        FOCUSED: "aui-restfultable-focused",
        MOVEABLE: "aui-restfultable-movable",
        DISABLED: "aui-restfultable-disabled",
        SUBMIT: "aui-restfultable-submit",
        CANCEL: "aui-restfultable-cancel",
        EDIT_ROW: "aui-restfultable-editrow",
        CREATE: "aui-restfultable-create",
        DRAG_HANDLE: "aui-restfultable-draghandle",
        ORDER: "aui-restfultable-order",
        EDITABLE: "aui-restfultable-editable",
        ERROR: "error",
        DELETE: "aui-restfultable-delete",
        LOADING: "loading"
    };

    // Custom events
    AJS.RestfulTable.Events = {

        // AJS events
        REORDER_SUCCESS: "RestfulTable.reorderSuccess",
        ROW_ADDED: "RestfulTable.rowAdded",
        ROW_REMOVED: "RestfulTable.rowRemoved",
        EDIT_ROW: "RestfulTable.switchedToEditMode",
        SERVER_ERROR: "RestfulTable.serverError",

        // backbone events
        CREATED: "created",
        UPDATED: "updated",
        FOCUS: "focus",
        BLUR: "blur",
        SUBMIT: "submit",
        SAVE: "save",
        MODAL: "modal",
        MODELESS: "modeless",
        CANCEL: "cancel",
        CONTENT_REFRESHED: "contentRefreshed",
        RENDER: "render",
        FINISHED_EDITING: "finishedEditing",
        VALIDATION_ERROR: "validationError",
        SUBMIT_STARTED: "submitStarted",
        SUBMIT_FINISHED: "submitFinished",
        INITIALIZED: "initialized",
        ROW_INITIALIZED: "rowInitialized",
        ROW_EDIT: "editRow"
    };

})(AJS.$);
