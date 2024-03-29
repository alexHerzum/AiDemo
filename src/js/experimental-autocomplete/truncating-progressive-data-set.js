/**
 * This object serves as part of a series of components to handle the various aspects of autocomplete controls.
 */

AJS.TruncatingProgressiveDataSet = AJS.ProgressiveDataSet.extend(
{
    /**
     * @class AJS.TruncatingProgressiveDataSet
     *
     * This is a subclass of AJS.ProgressiveDataSet. It differs from the superclass
     * in that it works on large data sets where the server truncates results.
     *
     * Rather than determining whether to request more information based on its cache,
     * it uses the size of the response.
     *
     * @example
     * var source = new AJS.TruncatingProgressiveDataSet([], {
     *     model: Backbone.Model.extend({ idAttribute: "username" }),
     *     queryEndpoint: "/jira/rest/latest/users",
     *     queryParamKey: "username",
     *     matcher: function(model, query) {
     *         return _.startsWith(model.get('username'), query);
     *     },
     *     maxResponseSize: 20
     * });
     * source.on('respond', doStuffWithMatchingResults);
     * source.query('john');
     * @augments AJS.ProgressiveDataSet
     */
     initialize: function(models, options) {
         this._maxResponseSize = options.maxResponseSize;
         AJS.ProgressiveDataSet.prototype.initialize.call(this, models, options);
     },
     
     shouldGetMoreResults: function(results) {
        var response = this.findQueryResponse(this.value);
        return !response || response.length === this._maxResponseSize;
     },
     
     /**
      * Returns the response for the given query.
      *
      * The default implementation assumes that the endpoint's search algorithm is a prefix
      * matcher.
      *
      * @param query the value to find existing responses
      * @return {Object[]} an array of values representing the IDs of the models provided by the response for the given query.
      * Null is returned if no response is found.
      */
     findQueryResponse: function(query) {
         while (query) {
             var response = this.findQueryCache(query);
             if (response) {
                 return response;
             }
             query = query.substr(0, query.length - 1);
         }
         return null;
     }
});