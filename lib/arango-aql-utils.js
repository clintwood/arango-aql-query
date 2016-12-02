'use babel';

import request from 'superagent';
import proxy from 'superagent-proxy';
import vm from 'vm';

import { config } from './arango-aql-config';

// add proxy
proxy(request);

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
      // HACK: first try evaluate as JS
      try {
        payload.bindVars = safeEval(match[1]);
      } catch (e) {
        // eat up error
      }
      if (!payload.bindVars) {
        // then try JSON
        try {
          payload.bindVars = JSON.parse(match[1]);
        } catch (e) {
          reject(e);
        }
      }
    }

    // build requet url
    const url = `${liveConfig.serverUri}/_db/${liveConfig.database ? liveConfig.database : '_system'}/_api/cursor`;

    // setup request
    const req = request.post(url);
    if (liveConfig.proxyUri) {
      req.proxy(liveConfig.proxyUri);
    }

    // perform request
    req
      .send(payload)
      .end((err, res) => {
        if (err) {
          if (!res.ok && res.error) {
            if (res.error.text) {
              resolve(JSON.parse(res.error.text));
            } else {
              resolve(res.error.toString());
            }
          } else {
            reject(err);
          }
        } else {
          const result = res.body;
          const end = Date.now();
          if (liveConfig.includeRequestTime) {
            result.requestMilliseconds = (end - start);
          }
          resolve(result);
        }
      });
  });
}
