// ==UserScript==
// @name         GitHub markdown toc
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add table of content
// @author       You
// @match        https://github.com/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';
  const addToc = () => {
    const textArea = document.getElementsByTagName('textarea')[0];
    const value = textArea.value;
    const selectionStart = textArea.selectionStart;
    let result = '';
    value.match(/#+ [^\n]*/g).forEach(h => {
      const sharpCount = h.match(/#+/)[0].length;
      const header = h.replace(/#+ /, '');
      const link = '#' + header.replace(/ /g, '-').replace(/\/|\.|\(|\)/g, '').toLowerCase();
      result += `${' '.repeat((sharpCount - 1) * 2)}- [${header}](${link})\n`;
    });
    textArea.value = textArea.value.substring(0,selectionStart) + result + textArea.value.substring(selectionStart);
  };
  GM_registerMenuCommand('Add toc', addToc);
})();