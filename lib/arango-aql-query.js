'use babel';

import path from 'path';
import { ensureFileSync } from 'fs-extra';
import { parse, execute } from './arango-aql-utils';

function ensureResultsFile(config, aqlFile) {
  // base the result file off of the aql file
  let resultDir = path.dirname(aqlFile);
  // appending resultsPath setting if set
  if (config.resultsPath) {
    resultDir = path.join(resultDir, config.resultsPath);
  }

  // switch extensions
  const resultFile = path.join(resultDir, `${path.basename(aqlFile, '.aql')}.json`);

  // ensure it exists
  ensureFileSync(resultFile);

  return resultFile;
}


function outputResultsToEditor(resultEditor, config, result) {
  let resultText = (typeof result === 'object') ? JSON.stringify(result, null, 2) : result;

  // add config in result
  if (config.showConfigInOutput) {
    resultText = `// config\n${JSON.stringify(config, null, 2)}\n// result\n${resultText}`;
  }

  // append?
  if (!config.showConfigInOutput && config.appendResults) {
    if (resultEditor.getText().length > 0) {
      resultEditor.moveToBottom();
      resultEditor.insertText('\n'); // TODO: Determine buffer preferred line endings
    }
    resultEditor.insertText(resultText);
  } else {
    resultEditor.setText(resultText);
  }

  // auto save
  if (config.autoSaveResults) {
    resultEditor.save();
  }
}


export function execAqlQuery() {
  const config = atom.config.get('arango-aql-query');
  // only query if the active editor has a .aql extension
  let aqlEditor = atom.workspace.getActivePaneItem();
  if (aqlEditor && !aqlEditor.buffer.file) {
    return atom.notifications.addWarning('Please first save this file with a \'.aql\' file extension before executing.');
  }

  let aqlFile = aqlEditor.buffer.file.path;
  // if the extension is '.json' try find and use the open editor
  if (path.extname(aqlFile).toLowerCase() === '.json') {
    const file = config.resultsPath ?
      aqlFile.replace(`${config.resultsPath}/`, '').replace(/\.json/i, '.aql') :
      aqlFile.replace(/\.json/i, '.aql');
    const editor = atom.workspace.getPaneItems().find(e => file === e.buffer.file.path);
    if (editor) {
      aqlFile = file;
      aqlEditor = editor;
    }
  }

  if (path.extname(aqlFile).toLowerCase() !== '.aql') {
    return atom.notifications.addWarning('Please select a file with a \'.aql\' extension.');
  }

  // try grab selected text ranges
  let text;
  const selectedBufferRanges = aqlEditor.getSelectedBufferRanges();
  if (selectedBufferRanges.length) {
    text = selectedBufferRanges.map(r => aqlEditor.getTextInBufferRange(r)).join('');
  }
  // fallback to all editor text
  if (!text) text = aqlEditor.getText();
  if (!text) {
    return atom.notifications.addWarning('No query text selected or the \'.aq\' file is empty.');
  }

  // get a copy of settings
  const liveCconfig = {
    ...config,
    ...parse(text), // parse editor text for config settings
  };


  // ensure there is a results file
  const resultFile = ensureResultsFile(liveCconfig, aqlFile);

  // determine split setting
  let split;
  if (liveCconfig.openToTheRight) {
    split = 'right';
  }

  // open or create a results file
  atom.workspace
    .open(resultFile, {
      split,
      changeFocus: true,
      searchAllPanes: true,
    })
    .then((resultEditor) => {
      // check clear before execute
      if (!liveCconfig.appendResults && liveCconfig.clearOutputBeforeRequest) {
        resultEditor.setText('Executing query...');
      }

      // perform the request
      execute(liveCconfig, text)
        .then(result => outputResultsToEditor(resultEditor, liveCconfig, result))
        .catch(err => outputResultsToEditor(resultEditor, liveCconfig, err));
    })
    .done();
}
