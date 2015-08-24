(function () {
    'use strict';

    angular.module('resourceFactory', ['ngResource']).

        provider('resourceFactory', function () {
            var baseUrl = '';
            this.baseUrl = function (url) {
                //getter
                if (angular.isUndefined(url)) {
                    return baseUrl;
                }
                //setter
                baseUrl = url;
                return this;
            };

            this.$get = ['$resource', function ($resource) {
                var ACTIONS = {
                    'get': {method: 'GET'},
                    'save': {method: 'POST'},
                    'query': {method: 'GET', isArray: true},
                    'remove': {method: 'DELETE'},
                    'delete': {method: 'DELETE'},
                    'update': {method: 'PUT'},
                    'patch': {
                        method: 'PUT',
                        headers: {
                            'X-HTTP-Method-Override': 'PATCH'
                        }
                    }
                };

                function ResourceFactory(url, paramDefaults, actions) {
                    url = baseUrl + url;
                    actions = angular.extend({}, ACTIONS, actions);

                    angular.forEach(actions, function (action) {
                        if (action.url) {
                            action.url = baseUrl + action.url;
                        }
                    });

                    return $resource(url, paramDefaults, actions);
                }

                return ResourceFactory;
            }];
        });

})();
