var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var suffixes = ['zip', 'app', 'apk'];

// returns last filename in a path string
var lastFile = function(fullPath) {
  return _.last(fullPath.split(path.sep));
}

var getOptionalDeps = function() {
  return Object.keys(require('./package.json').optionalDependencies);
}

var appPathsForModule = function(module) {
  var moduleEntrypoint = require.resolve(module);

  if (_.last(moduleEntrypoint.split('.')) == 'json') {
    var moduleBasePath = moduleEntrypoint.split(path.sep).slice(0, -1).join(path.sep);
    var paths = require(module);
    return paths.map(function(appPath) {
      return moduleBasePath + path.sep + path.normalize(appPath);
    });
  }
  else {
    return [moduleEntrypoint];
  }

}

// returns an array of all app files pointed to within the package.json's optionalDependencies
// for most apps this is equivalent to the 'main' entrypoint for the module
// some modules 'main' entrypoint is a .json file which yields a registry of multiple app binaries contained in the module, these are all returned.
var getPathsFromOptionalDeps = function() {

  var unflattened = getOptionalDeps().map(appPathsForModule);
  return _.flatten(unflattened);
}


var getApp = function(app) {
  // first search npm modules
  var optionalDeps = getPathsFromOptionalDeps();
  optionalDeps = _.sortBy(optionalDeps, 'length');
  var appPath = _.find(optionalDeps, function(name) {
    return lastFile(name).indexOf(app) >= 0;
  });

  if (appPath) {
    return appPath;
  }

  // then search static apps
  var preBuilt = fs.readdirSync(path.resolve(__dirname, 'pre-built'));
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
  var optionalDeps = getPathsFromOptionalDeps();
  optionalDeps = optionalDeps.map(lastFile);

  var preBuilt = fs.readdirSync(path.resolve(__dirname, 'pre-built'));

  return optionalDeps.concat(preBuilt).map(dropSuffix);
}
