'use babel';

import request from 'superagent';
import proxy from 'superagent-proxy';

// add proxy
proxy(request);

let rxBindVar = /^\s*bindVars\:\s*(\{.*\})$/m;

export function parse(keys, text) {
  let o = {};
  let lines = text.split(/[\r?\n]/);
  keys = keys.map(k => ({
      ...k,
      rx: new RegExp('^\\s*' + k.key + ':[\\s\'"]*(\\S*)[\\s\'"]*$')
    })
  );

  for (line of lines) {
    for (key of keys) {
      let match = key.rx.exec(line);
      if (match) {
        try {
          value = match[1];
          // TODO: can atom's config coerce logic be used here?
          switch(key.schema.type) {
            case 'integer':
              value = parseInt(value, 10);
              break;
            case 'boolean':
              value = value == 'true';
              break;
          }
          o[key.key] = value;
        } catch(err) {
          // TODO: setting to mute this warning
          atom.notifications.addWarning('Could not coerce \'' + key.key + ': ' + value + '\' to type \'' + key.schema.type + '\'');
        }
      }
    }
  }
  return o;
}

export function execute(config, text) {
  return new Promise((resolve/*, reject*/) => {
    // start timing
    let start = Date.now();

    // setup query
    let payload = {
      query: text,
    };

    // bindVars
    let match = rxBindVar.exec(text);
    if (match) {
      payload.bindVars = JSON.parse(match[1]);
    }
    // setup requet url
    let url = config.serverUri;
    if (config.database) {
      url = url + '/_db/' + config.database + '/_api/cursor';
    } else {
      url = url + '/_db/_system/_api/cursor';
    }

    // setup request
    let req = request.post(url);
    if (config.proxyUri)
      req = req.proxy(config.proxyUri);

    // perform request
    req
      .send(payload)
      .end((err, res) => {
        if (err) {
          if (res && res.body)
            resolve(res.body);
          else
            resolve(err);
        } else {
          let result = res.body;
          let end = Date.now();
          if (config.includeRequestTime) {
            result.requestMilliseconds = (end - start);
          }
          resolve(result);
        }
      });
  });
}
