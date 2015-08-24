/// <reference path="../../typings/tsd.d.ts" />


import 'angular';
//import 'angular-resource';
import 'resource-factory';
import {MainController} from './main/main-controller';


angular.module('app', ['resourceFactory'])
    .controller('MainController', MainController);


// Bootstrap

angular.element(document).ready(function () {
    angular.bootstrap(document.body, ['app'], {
        strictDi: true
    });
});