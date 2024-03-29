AJS.QueryInput = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'changed', 'val');
        this._lastValue = this.val();
        this.$el.bind('keyup focus', this.changed);
    },
    val: function () {
        return this.$el.val.apply(this.$el, arguments);
    },
    changed: function() {
        if (this._lastValue != this.val()) {
            this.trigger('change', this.val());
            this._lastValue = this.val();
        }
    }
});