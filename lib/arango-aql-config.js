'use babel';

/* eslint max-len: 0 */

export const config = {
  serverUri: {
    title: 'Server URI',
    type: 'string',
    default: 'http://localhost:8529',
    description: 'ArangoDB server endpoint URI (config.serverUri)',
  },

  auth: {
    title: 'Authorization',
    type: 'string',
    default: 'root',
    description: 'Auth in the form of `username[:password]` (config.auth).',
  },

  proxy: {
    title: 'Proxy Options (Axios)',
    type: 'string',
    default: '',
    description: 'Proxy Options, e.g. `{ host: \'127.0.0.1\', port: 8888, auth: { username: root, password: \'foobar\' } }` (config.proxy)',
  },

  database: {
    title: 'Default Database',
    type: 'string',
    default: '_system',
    description: 'Default DB (config.database)',
  },

  resultsPath: {
    title: 'Results Path',
    type: 'string',
    default: '_results',
    description: 'Path relative to .aql file in which to save output results (config.resultsPath)',
  },

  openToTheRight: {
    title: 'Open to the Right',
    type: 'boolean',
    default: true,
    description: 'Open results file in a split pane to the right (config.openToTheRight)',
  },

  appendResults: {
    title: 'Append Results',
    type: 'boolean',
    default: false,
    description: 'Append results to existing output file (config.appendResults)',
  },

  autoSaveResults: {
    title: 'Auto-save Results',
    type: 'boolean',
    default: true,
    description: 'Auto save results to results file (config.autoSaveResults)',
  },

  includeRequestTime: {
    title: 'Include Request Time',
    type: 'boolean',
    default: false,
    description: 'Include request time in output results as \'requestMilliseconds\' (config.includeRequestTime)',
  },

  clearOutputBeforeRequest: {
    title: 'Clear Output Before Request',
    type: 'boolean',
    default: true,
    description: 'Clear output file before the HTTP request is made. Ignored if \'Append results\' is true (config.clearOutputBeforeRequest)',
  },
  showConfigInOutput: {
    title: 'Show Config in output (overrides Append Results to not set)',
    type: 'boolean',
    default: false,
    description: 'Show the final config which may include changes from the AQL file in the output (config.showConfigInOutput)',
  },
};
