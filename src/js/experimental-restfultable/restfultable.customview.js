/*
 * Defining Custom renderer classes for people to extend.
 * We do this to
 * - Hide implementation (backbone)
 * - Future proof ourselves. We can modify peoples custom renderers easy in the future by adding to base class.
 */
AJS.RestfulTable.CustomEditView = AJS.RestfulTable.CustomCreateView = AJS.RestfulTable.CustomReadView = Backbone.View;