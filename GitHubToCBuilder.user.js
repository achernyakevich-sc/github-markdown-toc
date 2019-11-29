// ==UserScript==
// @name         GitHubToCBuilder
// @namespace    https://scand.com/
// @version      0.1
// @description  ToC builder for GitHub markdown markup docs (.md and Wiki)
// @author       vkuleshov-sc
// @author       achernyakevich-sc
// @match        https://github.com/*
// @grant        GM_log
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const getAnchor = text => '#' + text.replace(/ /g, '-').replace(/\t/, '--').replace(/[^\d\w-_#]/g, '').toLowerCase();

  const getSharpCount = value => value.match(/#+/) ? value.match(/#+/)[0].length : 0;

  const getHeaderText = headerLine => headerLine.replace(/#+\s+/, '');

  const getHeadersLines = value => value.match(/#+\s+[^\r\n]*/g);

  const createToc = value => {
    let result = '';
    getHeadersLines(value).forEach(line => {
      const sharpCount = getSharpCount(line);
      const text = getHeaderText(line);
      const anchor = getAnchor(text);
      result += `${' '.repeat((sharpCount - 1) * 2)}- [${text}](${anchor})\n`;
    });
    return result;
  }

  //{can be deleted
  (() => {
    const test = ({ input, output, testingFunc }) => {
      if (JSON.stringify(testingFunc(input)) !== JSON.stringify(output)) {
        GM_log(`${testingFunc.name}(${JSON.stringify(input)}) !== ${JSON.stringify(output)}`);
        GM_log(`${testingFunc.name}(${JSON.stringify(input)}) ==  ${JSON.stringify(testingFunc(input))}`);
      }
    };
    const testCases = [
      {
        input: '   123',
        output: 0,
        testingFunc: getSharpCount,
      },
      {
        input: '#########################               123',
        output: 25,
        testingFunc: getSharpCount,
      },
      {
        input: 'ab(c)?:;\'0!@$-%/\\1_^|23\tDEF',
        output: '#abc0-1_23--def',
        testingFunc: getAnchor,
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
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: ['# header1', '### header2 some text', '## header3'],
        testingFunc: getHeadersLines,
      },
      {
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: '- [header1](#header1)\n    - [header2 some text](#header2-some-text)\n  - [header3](#header3)\n',
        testingFunc: createToc,
      },
    ];
    testCases.forEach(test);

  })();
  //can be deleted}

  const addToc = () => {
    const textArea = document.getElementsByTagName('textarea')[0];
    const selectionStart = textArea.selectionStart;
    const toc = createToc(textArea.value);
    textArea.value = textArea.value.substring(0, selectionStart) + toc + textArea.value.substring(selectionStart);
  };

  GM_registerMenuCommand('Add toc', addToc);
})();
