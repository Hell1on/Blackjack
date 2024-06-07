'use strict';
import { GAME, dealCards } from './js/game.js';
import { showWinnerMessage, showDealerCard } from './js/ui.js';

const canSplit = (sumStartPointsPlayer) => {
  const [firstCard, secondCard] = GAME.playerHand;
  const isPair = +firstCard.value === +secondCard.value;
  const isTenPair = ['10', 'j', 'q', 'k'].includes(firstCard.value) && ['10', 'j', 'q', 'k'].includes(secondCard.value);
  const hasAce = ['a'].includes(firstCard.value, secondCard.value);
  const isSumTen = sumStartPointsPlayer / 2 === 10;

  return isPair || (isSumTen && isTenPair) || hasAce;
};

const startGame = () => {
  const sumStartPointsPlayer = dealCards(GAME.deck)[1];
  if (sumStartPointsPlayer === 21) {
    showDealerCard()
    return showWinnerMessage(1);
  }

  if (canSplit(sumStartPointsPlayer)) {
    document.querySelector("#split").classList.remove('hidden');
  }
};

GAME.initializeDeck()

export { startGame };
