'use strict';
import { GAME, dealCards } from './js/game.js';
import { showWinnerMessage } from './js/ui.js';

const startGame = () => {
  const sumStartPointsPlayer = dealCards(GAME.deck)[1];
  if (sumStartPointsPlayer === 21) {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
    return showWinnerMessage();
  }

  if ((sumStartPointsPlayer / 2 === +GAME.playerHand[0].value) || (sumStartPointsPlayer / 2 === 10 &&
      [GAME.playerHand[0].value, GAME.playerHand[1].value].every(value => ['10', 'j', 'q', 'k'].includes(value))) ||
      ['a'].includes(GAME.playerHand[0].value, GAME.playerHand[1].value)) {
    document.querySelector("#split").classList.remove('hidden');
  }
};

GAME.initializeDeck()
startGame()

export { startGame };
