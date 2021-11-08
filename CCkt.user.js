// ==UserScript==
// @name CC Kitchen Timer
// @include /https?://orteil.dashnet.org/cookieclicker/
// ==/UserScript==

const readyCheck = setInterval(() => {
  const Game = unsafeWindow.Game;

  if (typeof Game !== 'undefined' && typeof Game.ready !== 'undefined' && Game.ready) {
    Game.LoadMod('https://3plus4i.github.io/CCkitchentimer/main.js');
    clearInterval(readyCheck);
  }
}, 1000);
