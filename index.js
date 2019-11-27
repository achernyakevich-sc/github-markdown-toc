// ==UserScript==
// @name         GitHub markdown toc
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function () {
  const addToc = () => {
    const textArea = document.getElementsByTagName('textarea')[0];
    const value = textArea.value;
    let result = '';
    value.match(/#+ [^\n]*/g).forEach(h => {
      const sharpCount = h.match(/#+/)[0].length;
      const header = h.replace(/#+ /, '');
      const link = '#' + header.replace(/ /g, '-').replace(/\//g, '').toLowerCase();
      result += `${' '.repeat((sharpCount - 1) * 2)}- [${header}](${link})\n`;
    });
    textArea.value = result + value;
  };

  const tocButton = document.createElement('button');
  tocButton.innerHTML = 'toc';
  tocButton.type = 'button';
  tocButton.className = 'btn btn-sm hide-sm function-button';
  tocButton.addEventListener('click', addToc);

  const btnList = document.getElementById('gollum-editor-function-buttons');
  btnList.appendChild(tocButton);
})();