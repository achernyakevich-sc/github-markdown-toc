// ==UserScript==
// @name         GitHubToCBuilder
// @namespace    https://scand.com/
// @version      0.1.6
// @description  ToC builder for GitHub markdown markup docs (.md and Wiki)
// @author       vkuleshov-sc
// @author       achernyakevich-sc
// @match        https://github.com/*
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  const ERROR_TYPES = {
    DUPLICATED_HEADER: 'ERROR_TYPE_DUPLICATED_HEADER'
  };

  const getHeaderDepth = headerLine => {
    return headerLine.match(/#+/) ? headerLine.match(/#+/)[0].length : 0;
  };

  const getHeaderText = headerLine => {
    return headerLine.replace(/#+\s+/, '')
                     // For link in header we keep text only (remove URL and brackets) 
                     .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  };

  const getHeaderAnchor = headerText => {
    return '#' + headerText.replace(/ /g, '-').replace(/\t/, '--').replace(/[^\d\w-_#]/g, '').toLowerCase();
  };

  const getHeaderLines = mdText => {
    return mdText.split(/[\r\n]/).
      filter(str => str.match(/^\s{0,3}#+\s+[^\r\n]*/g)).
      map(str => str.trim());
  };

  const getToCForMarkdownMarkupText = mdText => {
    let toc = '';
    let anchors = [];
    let errors = [];
    const headerLines = getHeaderLines(mdText);
    if (headerLines) {
      for (let i = 0; i < headerLines.length; i++) {
        const line = headerLines[i];
        const hDepth = getHeaderDepth(line);
        const hText = getHeaderText(line);
        const hAnchor = getHeaderAnchor(hText);

        // Check for duplication of header
        if (-1 == anchors.indexOf(hAnchor)) {
          anchors.push(hAnchor);
          toc += `${' '.repeat((hDepth - 1) * 2)}- [${hText}](${hAnchor})\n`;
        } else {
          errors.push({
            type: ERROR_TYPES.DUPLICATED_HEADER,
            value: {
              anchor: hAnchor,
              text: hText
            },
            message: "Detected duplicated header"
          });
        }
      }
    }

    return { errors: errors, toc: toc };
  };

  const getWikiTextAreaElement = () => {
    return document.getElementById('gollum-editor-body');
  };

  const groupBy = (collection, key) => {
    const keyProvider = (typeof key === 'function') ? key : item => { return item[key] };

    let result = new Map();
    collection.forEach(item => {
      const itemKey = keyProvider(item);
      const itemCollection = result.get(itemKey);
      if (itemCollection) {
        itemCollection.push(item);
      } else {
        result.set(itemKey, [item]);
      }
    });

    return result;
  };

  const alertErrorsHandler = errors => {
    // Group errors by type
    groupBy(errors, 'type').forEach((errorsByType, errorType) => {
      switch (errorType) {
        case ERROR_TYPES.DUPLICATED_HEADER:
          // Group duplicated titles by anchor
          const duplicatesByAnchor = groupBy(errorsByType, error => { return error.value.anchor });
          let errorMsg = "Detected the following duplicated headers:\n";
          duplicatesByAnchor.forEach((errorsByAnchor) => {
            errorMsg += "\n" + errorsByAnchor[0].value.text + " (" + (errorsByAnchor.length + 1) + ")";
          });
          alert(errorMsg);
          break;

        default:
          errorsByType.forEach(error => {
            alert(error.message);
          });
      }
    });
  };

  const errorsHandlers = [alertErrorsHandler];

  const copyToCForMarkdownMarkupTextToClipboard = () => {
    const textArea = getWikiTextAreaElement();
    if (textArea) {
      const result = getToCForMarkdownMarkupText(textArea.value);
      if (!result.errors.length) {
        GM_setClipboard(result.toc);
        alert('ToC built from GitHub Wiki page content and copied to the clipboard!');
      } else {
        errorsHandlers.forEach(errorsHandler => errorsHandler(result.errors));
      }
    } else {
      alert('Textarea with Markdown Markup is not detected!');
    }
  };

  const copyToCForSelectedMarkdownMarkupTextToClipboard = () => {
    const selectedText = document.getSelection().toString();
    if (selectedText !== '') {
      const result = getToCForMarkdownMarkupText(selectedText);
      if (!result.errors.length) {
        GM_setClipboard(result.toc);
        alert('ToC built from selected Markdown Markup and copied to the clipboard!');
      } else {
        errorsHandlers.forEach(errorsHandler => errorsHandler(result.errors));
      }
    } else {
      alert('Nothing is selected!');
    }
  };

  if (getWikiTextAreaElement()) {
    GM_registerMenuCommand('Build ToC for Wiki content (editor->clipboard)', copyToCForMarkdownMarkupTextToClipboard);
  } else {
    GM_registerMenuCommand('Build ToC for selected Markdown Markup (selection->clipboard)', copyToCForSelectedMarkdownMarkupTextToClipboard);
  }

  // Tests - used only for development, can be commented out or deleted
  (() => {
    const test = ({ input, output, testingFunc, field }) => {
      let result = testingFunc(input);
      if (field) {
        result = result[field]
      }

      if (JSON.stringify(result) !== JSON.stringify(output)) {
        GM_log(`${testingFunc.name}(${JSON.stringify(input)}) !== ${JSON.stringify(output)}`);
        GM_log(`${testingFunc.name}(${JSON.stringify(input)}) ==  ${JSON.stringify(result)}`);
        alert('Test failed, see details in console');
      }
    };
    const testCases = [
      {
        input: '   123',
        output: 0,
        testingFunc: getHeaderDepth,
      },
      {
        input: '#########################               123',
        output: 25,
        testingFunc: getHeaderDepth,
      },
      {
        input: 'ab(c)?:;\'0!@$-%/\\1_^|23\tDEF',
        output: '#abc0-1_23--def',
        testingFunc: getHeaderAnchor,
      },
      {
        input: '### header1',
        output: 'header1',
        testingFunc: getHeaderText,
      },
      {
        input: '# header1 and some text',
        output: 'header1 and some text',
        testingFunc: getHeaderText,
      },
      {
        input: '# Header with [GitHub](https://github.com/) and [Google](https://google.com/) links',
        output: 'Header with GitHub and Google links',
        testingFunc: getHeaderText,
      },
      {
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: ['# header1', '### header2 some text', '## header3'],
        testingFunc: getHeaderLines,
      },
      {
        input: `s # header1\r\n### header2 some text\n    # not header1\n   # header3 (some text)\n #not header2`,
        output: ['### header2 some text', '# header3 (some text)'],
        testingFunc: getHeaderLines,
      },
      {
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: '- [header1](#header1)\n    - [header2 some text](#header2-some-text)\n  - [header3](#header3)\n',
        field: 'toc',
        testingFunc: getToCForMarkdownMarkupText,
      },
    ];
    testCases.forEach(test);
  })();

})();
