##sample-apps##

`npm install sample-apps`


This module allows you to ask for apps by name and version, and it will return a full path to the .app, .apk or .zip file.

Some of the apps are just binaries we have, stored in the pre-built directory.
Others exist as their own npm modules, loaded as dependencies and made available here.

It shouldn't matter to the user whether they are pre-built or not.

The modularized apps are in the package.json file as "optional dependencies" which means if for some reason they can't be loaded, this module will still install the rest of the apps.
But if an app doesn't load, it won't be included in `list()`

##Usage##

```
sample_apps = require('sample-apps');

apps = sample_apps.list();

console.log(apps);
//[ 'ApiDemos-debug',
//  'UICatalog7.1',
//  'ContactManager-selendroid',
//  'ContactManager',
//  'TestApp',
//  'TestApp6.0',
//  'TestApp6.1',
//  'TestApp7.1',
//  'UICatalog6.0',
//  'UICatalog6.1',
//  'WebViewApp6.0',
//  'WebViewApp6.1',
//  'WebViewApp7.1' ]

pathToApiDemos = sample_apps('ApiDemos-debug');
// /Users/jonahss/sample-apps/node_modules/android-apidemos/bin/ApiDemos-debug.apk
```
