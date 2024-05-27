'use strict';

import {calculateHands, dealCard, GAME, getWinnerMessage} from './game.js';
import { startGame } from '../App.js';

const dealerPoints = document.querySelector("#dealer-points");
const playerPoints = document.querySelector("#player-points");
const message = document.querySelector("#message");
const countCardsInDeck = document.querySelector("#cards");
const standButton = document.querySelector("#stand");
const hitButton = document.querySelector("#hit");
const doubleButton = document.querySelector("#double");
const dealButton = document.querySelector("#deal");
const splitButton = document.querySelector("#split");
const playerHands = document.querySelector('#player-hands');

const removeButtons = () => {
    standButton.classList.add('hidden');
    hitButton.classList.add('hidden');
    doubleButton.classList.add('hidden');
    dealButton.classList.remove('hidden');
};

const showWinnerMessage = () => {
    const [sumPointsDealer, sumPointsPlayer, sumPointsSplit] = calculateHands(0);
    message.innerHTML = getWinnerMessage(sumPointsDealer, sumPointsPlayer, sumPointsSplit);
    removeButtons();
};

const setActiveHand = () => {
    const hands = document.querySelectorAll('.player-hand-item');
    for (let index = 0; index < hands.length; index++) {
        if (index === GAME.activeHand) {
            hands[index].classList.add('active-hand');
        } else {
            hands[index].classList.remove('active-hand');
        }
    }
};

const removePlayingCards = () => {
    const playingCards = document.querySelectorAll('.playing-card-item');
    playingCards.forEach(card => card.remove());
};

const stand = () => {
    if (!GAME.splitHand.length || GAME.activeHand) {
        if (!document.querySelector("#split").classList.contains('hidden')) splitButton.classList.add('hidden');
        const hideCard = document.getElementsByClassName("invisible")[0];
        hideCard.classList.remove("invisible");
        let [sumPointsDealer] = calculateHands(0);

        while (sumPointsDealer < 17) {
            dealCard("dealer-hand");
            sumPointsDealer = calculateHands(0)[0];
        }
        showWinnerMessage();
        return;
    }
    const sumPointsPlayer = calculateHands()[1];
    GAME.activeHand = 1;
    setActiveHand();
    if (sumPointsPlayer === 21) stand()
};
standButton.addEventListener("click", stand);

const hit = () => {
    if (!GAME.activeHand) {
        dealCard("player-hand");
    } else {
        dealCard("split-hand");
    }

    const sumPointsHand = calculateHands()[GAME.activeHand + 1];
    if (sumPointsHand === 21) {
        if (GAME.splitHand.length && GAME.activeHand === 0) {
            GAME.activeHand = 1;
            setActiveHand();
            return;
        }
        stand();
    }
    if (sumPointsHand > 21) {
        if (GAME.splitHand.length && GAME.activeHand === 0) {
            GAME.activeHand = 1;
            setActiveHand();
            return;
        }
        const hideCard = document.getElementsByClassName("invisible")[0];
        hideCard.classList.remove("invisible");
        showWinnerMessage();
    }
};
hitButton.addEventListener("click", hit);

const double = () => {
    if (!GAME.activeHand) {
        dealCard("player-hand");
    } else {
        dealCard("split-hand");
    }
    stand();
};
doubleButton.addEventListener("click", double);

const split = () => {
    if (GAME.playerHand.length === 2) {
        const hand1 = [GAME.playerHand[0]];
        const hand2 = [GAME.playerHand[1]];
        GAME.playerHand.pop();

        GAME.playerHand = hand1;
        GAME.splitHand = hand2;

        const newHandHTML = `
            <li class="player-hand-item split-hand-item">
                <ol class="split-hand playing-card-list">
                    <li class="playing-card-item">
                        <img src="src/cards/${GAME.splitHand[0].value}_${GAME.splitHand[0].suit}.png" class="playing-card-image" alt="${GAME.splitHand[0].value}_${GAME.splitHand[0].suit}">
                    </li>
                </ol>
            </li>
            `;
        playerHands.innerHTML += newHandHTML;

        const playingCard = document.getElementsByClassName('playing-card-item')[3];
        playingCard.remove();

        dealCard('player-hand');
        dealCard('split-hand');

        const sumPointsPlayer = calculateHands()[1];
        setActiveHand();
        if (sumPointsPlayer === 21) stand()
        splitButton.classList.add('hidden');
    }
};
splitButton.addEventListener("click", split);

const restart = () => {
    removePlayingCards();

    dealerPoints.innerHTML = '';
    playerPoints.innerHTML = '';
    message.innerHTML = '';
    countCardsInDeck.innerHTML = '';

    standButton.classList.remove('hidden');
    hitButton.classList.remove('hidden');
    doubleButton.classList.remove('hidden');
    dealButton.classList.add('hidden');
    splitButton.classList.add('hidden');
    const splitHand = document.getElementsByClassName('split-hand-item')[0];
    if (splitHand !== undefined) splitHand.remove();

    if (GAME.deck.length <= Math.round(104 * 0.2)) {
        GAME.initializeDeck();
        message.innerHTML = 'Cards shuffled';
    }
    GAME.dealerHand = [];
    GAME.playerHand = [];
    if (GAME.splitHand.length) GAME.splitHand = []
    GAME.activeHand = 0;

    startGame();
};
dealButton.addEventListener("click", restart);

export { removeButtons, showWinnerMessage, setActiveHand, removePlayingCards, stand, hit, double, split, restart };
