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

  const getHeaderAnchor = headerLine => {
    return '#' + headerLine.replace(/ /g, '-').replace(/\t/, '--').replace(/[^\d\w-_#]/g, '').toLowerCase();
  }

  const getHeaderDepth = headerLine => {
    return headerLine.match(/#+/) ? headerLine.match(/#+/)[0].length : 0;
  }

  const getHeaderText = headerLine => {
    return headerLine.replace(/#+\s+/, '');
  }

  const getHeadersLines = mdText => {
    return mdText.match(/#+\s+[^\r\n]*/g);
  }

  const createToC = mdText => {
    let result = '';
    getHeadersLines(mdText).forEach(line => {
      const hDepth = getHeaderDepth(line);
      const hText = getHeaderText(line);
      const hAnchor = getHeaderAnchor(hText);
      result += `${' '.repeat((hDepth - 1) * 2)}- [${hText}](${hAnchor})\n`;
    });
    return result;
  }

  const copyToClipboard = (value) => {
    const tmp = document.createElement('textarea');
    document.body.appendChild(tmp);
    tmp.value = value;
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
  }

  const putToCToClipboard = () => {
    const textArea = document.getElementsByTagName('textarea')[0];
    copyToClipboard(createToC(textArea.value));
  };

  GM_registerMenuCommand('Put ToC to clipboard', putToCToClipboard);

  // Tests - used only for development, can be commented out or deleted
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
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: ['# header1', '### header2 some text', '## header3'],
        testingFunc: getHeadersLines,
      },
      {
        input: `# header1\r\n### header2 some text\n## header3\r\n`,
        output: '- [header1](#header1)\n    - [header2 some text](#header2-some-text)\n  - [header3](#header3)\n',
        testingFunc: createToC,
      },
    ];
    testCases.forEach(test);
  })();

})();
