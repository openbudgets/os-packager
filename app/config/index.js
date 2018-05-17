'use strict';

var path = require('path');
var nconf = require('nconf');

var DEFAULT_HOST = process.env.OS_BASE_URL;
var DEFAULT_BASE_PATH = '/';

nconf.file({
  file: path.join(__dirname, '/../../settings.json')
});

var conductorHost = process.env.OS_CONDUCTOR_URL || DEFAULT_HOST;

// Options for frontend
var frontendOptions = {
  conductor: {
    authLibUrl: conductorHost + '/user/lib',
    conductorUrl: conductorHost + '/datastore/',
    conductorInfoUrl: conductorHost + '/datastore/info',
    publishUrl: conductorHost + '/package/upload',
    statusUrl: conductorHost + '/package/status',
    pollInterval: process.env.POLL_INTERVAL || 3000
  },

  adapterUrl: process.env.FDP_ADAPTER_URL ||
    DEFAULT_HOST + '/fdp-adapter/convert',

  proxyUrl: 'proxy?url=',
  osViewerUrl: process.env.OS_VIEWER_URL || DEFAULT_HOST + '/viewer/',
  osAdminUrl: process.env.OS_ADMIN_URL || DEFAULT_HOST + '/admin/',
  cosmoplitanUrl: process.env.OS_COSMOPOLITAN_URL
};

// this is the object that you want to override in your own local config
nconf.defaults({
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG || false,
  app: {
    port: process.env.PORT || 5000
  },
  frontend: frontendOptions,
  basePath: process.env.OS_PACKAGER_BASE_PATH || DEFAULT_BASE_PATH,
  snippets: {
    ga: process.env.OS_SNIPPETS_GA || null,
    raven: process.env.OS_SNIPPETS_RAVEN || null
  },
  sentryDSN: process.env.SENTRY_DSN || null
});

module.exports = nconf;
