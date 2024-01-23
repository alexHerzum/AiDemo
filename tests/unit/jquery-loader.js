/**
 * A requirejs plugin which is able to conditionally load the jquery-migrate plugin when it is required
 **/
define(['module', 'jquery-core'], function(module) {
    return {
        load: function(id, require, load, config) {
            if ($.browser) {
                // An older version of jQuery is being used. We don't need to load
                // anything extra
                load($);
            } else {
                // A modern version of jQuery is bring used. In order to ease the
                // adoption of it, we use the jquery-migrate plugin to restore some
                // or the removed functionality
                require(['jquery-migrate'], function() {
                    load($);
                });
            }
        }
    };
});
