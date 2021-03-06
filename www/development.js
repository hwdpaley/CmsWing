var thinkjs = require('thinkjs');
var path = require('path');
var lodash = require("lodash");
var rootPath = path.dirname(__dirname);
var instance = new thinkjs({
  APP_PATH: rootPath + path.sep + 'app',
  RUNTIME_PATH:rootPath + path.sep +'runtime',
  ROOT_PATH: rootPath,
  RESOURCE_PATH: __dirname,
  BIEBER_VERSION:'2.0.0',
  _:lodash,
  env: 'development'
});
//compile src/ to app/
instance.compile({
  //retainLines: true,
  log: true
});

instance.run();