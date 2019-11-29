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

  const getAnchor = text => '#' + text.replace(/ /g, '-').replace(/\/|\.|\(|\)/g, '').toLowerCase();

  const getSharpCount = value => value.match(/#+/)[0].length;

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

  const addToc = () => {
    const textArea = document.getElementsByTagName('textarea')[0];
    const selectionStart = textArea.selectionStart;
    const toc = createToc(textArea.value);
    textArea.value = textArea.value.substring(0, selectionStart) + toc + textArea.value.substring(selectionStart);
  };

  GM_registerMenuCommand('Add toc', addToc);
})();
