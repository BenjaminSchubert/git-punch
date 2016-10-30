/**
 * Service for the stats module
 */
require("angular").module('gstats.stats').factory('gstats.stats.service', function($state, $http) {
    return {
        /**
         * Get all user's repositories and data
         *
         * @returns {Promise}
         */
        get repositories() {
            return $http.get("api/private/repositories")
                .then(function(response) {
                    if (response.data.limitedUntil !== undefined) {
                        return Promise.reject({ limitedUntil: response.data.limitedUntil, data: response.data });
                    }
                    return response.data;
                });
        }
    }
});
