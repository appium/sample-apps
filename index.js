var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var suffixes = ['zip', 'app', 'apk'];

// returns last filename in a path string
var lastFile = function(fullPath) {
  return _.last(fullPath.split(path.sep));
}

var getApp = function(app) {
  // first search npm modules
  var optionalDeps = Object.keys(require('./package.json').optionalDependencies);
  optionalDeps = optionalDeps.map(require.resolve);
  var appPath = _.find(optionalDeps, function(name) {
    return lastFile(name).indexOf(app) >= 0;
  });

  if (appPath) {
    return appPath;
  }

  // then search static apps
  var preBuilt = fs.readdirSync('./pre-built');
  preBuilt = _.sortBy(preBuilt, 'length');
  var appPath = _.find(preBuilt, function(name) {
    return name.indexOf(app) >= 0;
  });

  if (appPath) {
    return require.resolve('./pre-built/' + appPath);
  }

  return undefined;
}

module.exports = getApp;

var dropSuffix = function(name) {
  var parts = name.split('.');

  while (_.contains(suffixes, parts[parts.length-1])) {
    parts.pop();
  }

  return parts.join('.');
}

module.exports.list = function() {
  var optionalDeps = Object.keys(require('./package.json').optionalDependencies);
  optionalDeps = _.compact(optionalDeps.map(require.resolve));
  optionalDeps = optionalDeps.map(lastFile);

  var preBuilt = fs.readdirSync('./pre-built');

  return optionalDeps.concat(preBuilt).map(dropSuffix);
}
