'use babel';

/* global atom */

import vm from 'vm';
import axios from 'axios';
import { config } from './arango-aql-config';

const rxBindVar = /^(?:\/\/)?\s*bindVars:\s*(\{.*\})$/m;

function safeEval(code, context, opts) {
  const sandbox = {};
  const resultKey = `SAFE_EVAL_${Math.floor(Math.random() * 1000000)}`;
  sandbox[resultKey] = {};
  const theCode = `${resultKey} = ${code}`;
  if (context) {
    Object.keys(context).forEach((key) => {
      sandbox[key] = context[key];
    });
  }
  vm.runInNewContext(theCode, sandbox, opts);
  return sandbox[resultKey];
}

function toObject(code) {
  let obj;
  // HACK: first try evaluate as JS
  try {
    obj = safeEval(code);
  } catch (e) {
    // eat up error
  }
  // in not successful try JSON
  if (!obj) {
    try {
      obj = JSON.parse(code);
    } catch (e) {
      // eat up error
    }
  }
  return obj;
}


export function parse(text) {
  const rxConfig = new RegExp(`^(?://)?\\s*(${Object.keys(config).join('|')}):\\s*['"]?(.*)["']?\\s*$`);

  const lines = text.split(/[\r?\n]/);
  const o = Object.create(null);
  for (const line of lines) {
    const match = rxConfig.exec(line);
    if (match) {
      const key = match[1];
      const schema = config[key];
      const value = match[2];
      try {
        // TODO: can atom's config coerce logic be used here?
        switch (schema.type) {
          case 'integer':
            o[key] = Number(value);
            break;
          case 'boolean':
            o[key] = value === 'true';
            break;
          case 'string':
            o[key] = value;
            break;
          default:
            throw new Error(`Unhandled config type: '${schema.type}'`);
        }
      } catch (err) {
        // TODO: setting to mute this warning
        atom.notifications.addWarning(`Could not coerce '${key}: ${value}' to type '${schema.type}'`);
      }
    }
  }
  return o;
}

export function execute(liveConfig, text) {
  return new Promise((resolve, reject) => {
    // start timing
    const start = Date.now();

    // setup query
    const payload = {
      query: text,
    };

    // bindVars
    const match = rxBindVar.exec(text);
    if (match) {
      payload.bindVars = toObject(match[1]);
      if (!payload.bindVars) {
        reject({ error: 'Parser', message: 'Cannot parse bindVars', source: match[1] });
      }
    }

    // build requet url
    const url = `${liveConfig.serverUri}/_db/${liveConfig.database ? liveConfig.database : '_system'}/_api/cursor`;

    // options
    let options;
    if (liveConfig.proxy) {
      if (!options) options = {};
      options.proxy = toObject(liveConfig.proxy);
      if (!options.proxy) {
        reject({ error: 'Parser', message: 'Cannot parse proxy options', source: liveConfig.proxy });
      }
    }

    if (liveConfig.auth) {
      if (!options) options = {};
      const auths = liveConfig.auth.split(':');
      options.auth = { username: auths[0], password: auths[1] };
    }

    // setup axios
    axios
      .post(url, payload, options)
      .then((res) => {
        const result = res.data;
        const end = Date.now();
        if (liveConfig.includeRequestTime) {
          result.requestMilliseconds = (end - start);
        }
        resolve(result);
      })
      .catch((err) => {
        reject({
          error: 'Request error',
          message: err.message,
          url,
          payload,
          options,
        });
      });
  });
}
