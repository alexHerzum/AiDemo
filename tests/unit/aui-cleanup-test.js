define(['aui-mocha'], function() {
    'use strict';
    afterEach(function(){
        AJS.mocha.warnIfLayersExist();
    });
});