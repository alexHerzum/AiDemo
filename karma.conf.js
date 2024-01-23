//This file exists so you can run karma.start from root, grunt does not use this file
module.exports = function(karma) {
    var config = require('./build/configs/karma-shared')();
    config.singleRun = false;
    config.autoWatch = true;
    karma.set(config);
};
