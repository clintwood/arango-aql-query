'use babel';

// import assign from 'object-assign';
import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';

import {parse, execute} from './arango-aql-utils';

function ensureResultsFile(config, aqlFile) {
  // base the result file off of the aql file
  // amending with resultsPath setting
  resultFile = path.dirname(aqlFile);
  if (config.resultsPath)
    resultFile = path.join(resultFile, config.resultsPath);
  if (!fs.existsSync(resultFile))
    mkdirp(resultFile);

  // switch extensions
  resultFile = path.join(resultFile, path.basename(aqlFile, '.aql') + '.json');

  // create if it does not exist
  if (!fs.existsSync(resultFile))
    fs.closeSync(fs.openSync(resultFile, 'w'));

  return resultFile;
}


function outputResultsToEditor(resultEditor, config, result) {
  // convert to json string if required
  if (typeof result == 'object')
    result = JSON.stringify(result, null, 2);

  // append?
  if (config.appendResults) {
    if (resultEditor.getText().length > 0) {
      resultEditor.moveToBottom();
      resultEditor.insertText('\n'); // TODO: Determine buffer preferred line endings
    }
    resultEditor.insertText(result);
  } else {
    resultEditor.setText(result);
  }

  // auto save
  if (config.autoSaveResults)
    resultEditor.save();
}


export function execAqlQuery() {
  // only query if the active editor is
  // has a file path with .aql extension
  let aqlFile;
  let aqlEditor = atom.workspace.getActivePaneItem();
  if (aqlEditor && !aqlEditor.buffer.file) {
    return atom.notifications.addWarning('Please save the file using a \'.aql\' extension before executing queries.');
  }
  aqlFile = aqlEditor.buffer.file.path;
  if (!aqlFile || path.extname(aqlFile) != '.aql') {
    return atom.notifications.addWarning('Please select a file with a \'.aql\' extension.');
  }

  // try grab selected text
  let text = aqlEditor.getSelectedText();
  // fallback to all editor text
  if (!text) text = aqlEditor.getText();
  if (!text) {
    return atom.notifications.addWarning('No query text selected or the \'.aq\' file is empty.');
  }

  // get a copy of settings
  let config = {...atom.config.get('arango-aql-query')};
  // parse editor text for config settings (maybe cache this)
  let keys = Object.keys(config).map(k => ({key: k, schema: atom.config.getSchema('arango-aql-query.' + k)}));
  let queryConfig = parse(keys, text);
  // override config settings with in-file-settings
  config = {...config, ...queryConfig};

  // ensure there is a results file
  let resultFile = ensureResultsFile(config, aqlFile);

  // determine split setting
  let split;
  if (config.openToTheRight)
    split = 'right';

  // open or create a results file
  atom.workspace
    .open(resultFile, {
      split: split,
      changeFocus: true,
      searchAllPanes: true
    })
    .then(resultEditor => {
      // check clear before execute
      if (!config.appendResults && config.clearOutputBeforeRequest)
        resultEditor.setText('Executing query...');

      // perform the request
      execute(config, text)
        .then(result => outputResultsToEditor(resultEditor, config, result))
        .catch(err => outputResultsToEditor(resultEditor, config, err));
    })
    .done();
}
