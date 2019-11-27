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

  const addToc = () => {
    let textArea = document.getElementsByTagName('textarea')[0];
    let value = textArea.value;
    let selectionStart = textArea.selectionStart;
    let result = '';

    value.match(/#+ [^\n]*/g).forEach(h => {
      let sharpCount = h.match(/#+/)[0].length;
      let header = h.replace(/#+ /, '');
      let link = '#' + header.replace(/ /g, '-').replace(/\/|\.|\(|\)/g, '').toLowerCase();
      result += `${' '.repeat((sharpCount - 1) * 2)}- [${header}](${link})\n`;
    });
    textArea.value = textArea.value.substring(0,selectionStart) + result + textArea.value.substring(selectionStart);
  };

  GM_registerMenuCommand('Add toc', addToc);
})();
