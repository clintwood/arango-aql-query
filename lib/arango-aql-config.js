'use babel';

/* eslint max-len: 0 */

export const config = {
  serverUri: {
    title: 'Server URI',
    type: 'string',
    default: 'http://root:@localhost:8529',
    description: 'ArangoDB server endpoint URI (config.serverUri)',
  },

  proxyUri: {
    title: 'Proxy URI',
    type: 'string',
    default: '',
    description: 'Proxy URI, e.g. http://127.0.0.1:8888 (config.proxyUri)',
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
