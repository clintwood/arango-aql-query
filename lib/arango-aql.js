'use babel';

/* global atom */

import { CompositeDisposable } from 'atom';
import { execAqlQuery } from './arango-aql-query';
import { config } from './arango-aql-config';

export default {
  config,
  arangoAqlQueryView: null,
  modalPanel: null,
  subscriptions: null,

  activate(/* state */) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'arango-aql-query:execaqlquery': (/* event */) => {
          this.execAqlQuery();
        },
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },

  execAqlQuery,
};
