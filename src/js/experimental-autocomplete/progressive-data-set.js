/**
 * @fileOverview describes a ProgressiveDataSet object.
 *
 * This object serves as part of a series of components to handle the various aspects of autocomplete controls.
 */

AJS.ProgressiveDataSet = Backbone.Collection.extend(
/** @lends AJS.ProgressiveDataSet.prototype */
{
    /**
     * @class AJS.ProgressiveDataSet
     *
     * A queryable set of data that optimises the speed at which responses can be provided.
     *
     * ProgressiveDataSet should be given a matcher function so that it may filter results for queries locally.
     *
     * ProgressiveDataSet can be given a remote query endpoint to fetch data from. Should a remote endpoint
     * be provided, ProgressiveDataSet will leverage both client-side matching and query caching to reduce
     * the number of times the remote source need be queried.
     *
     * @example
     * var source = new AJS.ProgressiveDataSet([], {
     *     model: Backbone.Model.extend({ idAttribute: "username" }),
     *     queryEndpoint: "/jira/rest/latest/users",
     *     queryParamKey: "username",
     *     matcher: function(model, query) {
     *         return _.startsWith(model.get('username'), query);
     *     }
     * });
     * source.on('respond', doStuffWithMatchingResults);
     * source.query('john');
     *
     * @augments Backbone.Collection
     *
     * @property {String} value the latest query for which the ProgressiveDataSet is responding to.
     * @property {Number} activeQueryCount the number of queries being run remotely.
     *
     * @constructs
     */
    initialize: function(models, options) {
        options || (options = {});
        if (options.matcher) {
            this.matcher = options.matcher;
        }
        if (options.model) {
            this.model = options.model; // Fixed in backbone 0.9.2
        }
        this._idAttribute = (new this.model()).idAttribute;
        this._maxResults = options.maxResults || 5;
        this._queryData = options.queryData || {};
        this._queryParamKey = options.queryParamKey || "q";
        this._queryEndpoint = options.queryEndpoint || "";
        this.value = null;
        this.queryCache = {};
        this.activeQueryCount = 0;
        _.bindAll(this, 'query', 'respond');
    },

    url: function() {
        return this._queryEndpoint;
    },

    /**
     * Sets and runs a query against the ProgressiveDataSet.
     *
     * Bind to ProgressiveDataSet's 'respond' event to receive the results that match the latest query.
     *
     * @param {String} query the query to run.
     */
    query: function(query) {
        var remote, results;

        this.value = query;
        results = this.getFilteredResults(query);
        this.respond(query, results);

        if (!query || !this._queryEndpoint || this.hasQueryCache(query) || !this.shouldGetMoreResults(results)) {
            return;
        }

        remote = this.fetch(query);

        this.activeQueryCount++;
        this.trigger('activity', { activity: true });
        remote.always(_.bind(function() {
            this.activeQueryCount--;
            this.trigger('activity', { activity: !!this.activeQueryCount });
        }, this));

        remote.done(_.bind(function(resp, succ, xhr) {
            this.addQueryCache(query, resp, xhr);
        }, this));
        remote.done(_.bind(function() {
            query = this.value;
            results = this.getFilteredResults(query);
            this.respond(query, results);
        }, this));
    },

    /**
     * Gets all the data that should be sent in a remote request for data.
     * @param {String} query the value of the query to be run.
     * @return {Object} the data to to be sent to the remote when querying it.
     * @private
     */
    getQueryData: function(query) {
        var params = _.isFunction(this._queryData) ? this._queryData(query) : this._queryData;
        var data = _.extend({}, params);
        data[this._queryParamKey] = query;
        return data;
    },

    /**
     * Get data from a remote source that matches the query, and add it to this ProgressiveDataSet's set.
     *
     * @param {String} query the value of the query to be run.
     * @return {jQuery.Deferred} a deferred object representing the remote request.
     */
    fetch: function(query) {
        var data = this.getQueryData(query);
        // {add: true} for Backbone <= 0.9.2
        // {update: true, remove: false} for Backbone >= 0.9.9
        var params = { add : true, update : true, remove : false, data : data };
        var remote = Backbone.Collection.prototype.fetch.call(this, params);
        return remote;
    },

    /**
     * Triggers the 'respond' event on this ProgressiveDataSet for the given query and associated results.
     *
     * @param {String} query the query that was run
     * @param {Array} results a set of results that matched the query.
     * @return {Array} the results.
     * @private
     */
    respond: function(query, results) {
        this.trigger('respond', {
            query: query,
            results: results
        });
        return results;
    },

    /**
     * A hook-point to define a function that tests whether a model matches a query or not.
     *
     * This will be called by getFilteredResults in order to generate the list of results for a query.
     *
     * (For you java folks, it's essentially a predicate.)
     *
     * @param {Backbone.Model} item a model of the data to check for a match in.
     * @param {String} query the value to test against the item.
     * @returns {Boolean} true if the model matches the query, otherwise false.
     * @function
     */
    matcher: function(item, query) { },

    /**
     * Filters the set of data contained by the ProgressiveDataSet down to a smaller set of results.
     *
     * The set will only consist of Models that "match" the query -- i.e., only Models where
     * a call to ProgressiveDataSet#matcher returns true.
     *
     * @param query {String} the value that results should match (according to the matcher function)
     * @return {Array} A set of Backbone Models that match the query.
     */
    getFilteredResults: function(query) {
        var results = [];
        if (!query) {
            return results;
        }
        results = this.filter(function(item) {
            return !!this.matcher(item, query);
        }, this);
        if (this._maxResults) {
            results = _.first(results, this._maxResults);
        }
        return results;
    },

    /**
     * Store a response in the query cache for a given query.
     *
     * @param {String} query the value to cache a response for.
     * @param {Object} response the data of the response from the server.
     * @param {XMLHttpRequest} xhr
     * @private
     */
    addQueryCache: function(query, response, xhr) {
        var cache = this.queryCache;
        var results = this.parse(response, xhr);
        cache[query] = _.pluck(results, this._idAttribute);
    },

    /**
     * Check if there is a query cache entry for a given query.
     *
     * @param query the value to check in the cache
     * @return {Boolean} true if the cache contains a response for the query, false otherwise.
     */
    hasQueryCache: function(query) {
        return this.queryCache.hasOwnProperty(query);
    },

    /**
     * Get the query cache entry for a given query.
     *
     * @param query the value to check in the cache
     * @return {Object[]} an array of values representing the IDs of the models the response for this query contained.
     */
    findQueryCache: function(query) {
        return this.queryCache[query];
    },

    /**
     *
     * @param {Array} results the set of results we know about right now.
     * @return {Boolean} true if the ProgressiveDataSet should look for more results.
     * @private
     */
    shouldGetMoreResults: function(results) {
        return results.length < this._maxResults;
    },

    /**
     *
     * @note Changing this value will trigger ProgressiveDataSet#event:respond if there is a query.
     * @param {Number} number how many results should the ProgressiveDataSet aim to retrieve for a query.
     */
    setMaxResults: function(number) {
        this._maxResults = number;
        this.value && this.respond(this.value, this.getFilteredResults(this.value));
    }
});
