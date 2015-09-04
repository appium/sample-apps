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
  try {
    var moduleEntrypoint = require.resolve(module);
  } catch (e) {
    if (e.code == "MODULE_NOT_FOUND") {
      return [];
    } else {
      throw e;
    }
  }

  var ext = _.last(moduleEntrypoint.split('.'));
  if (ext == 'json' || ext == 'js') {
    var moduleBasePath = moduleEntrypoint.split(path.sep).slice(0, -1).join(path.sep);
    var paths = require(module);
    if(paths.absolute) {
      // support for the more recent ios-test-app format
      paths = [paths.absolute.iphoneos, paths.absolute.iphonesimulator];
      return paths;
    }
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

// get an app by name.
// If you specify only the beginning of a name, return first alphabetical match
var _getApp = function(app) {

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

// get an app by name.
// If you specify only the beginning of a name, return first alphabetical match
// Optional `realDevice` param is a boolean.
// If true: add '-iphoneos' to the name of the app,
// otherwise adds '-iphonesimulator'. If false and no app
// is found, try to return an app just by name with no special suffix.
var getApp = function(app, realDevice) {
  var appPath;

  if (realDevice) {
    appPath = _getApp(app+'-iphoneos');
  } else {
    appPath = _getApp(app+'-iphonesimulator');
  }

  if (!appPath) {
    appPath = _getApp(app);
  }

  return appPath;
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
