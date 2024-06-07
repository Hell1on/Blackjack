'use strict';

import {calculateHands, dealCard, GAME, getWinner, updateBet} from './game.js';
import { startGame } from '../App.js';

const dealerPoints = document.querySelector("#dealer-points");
const playerPoints = document.querySelector("#player-points");
const message = document.querySelector("#message");
const countCardsInDeck = document.querySelector("#cards");
const balance = document.querySelector("#balance");
const bid = document.querySelector("#current-bet");
const standButton = document.querySelector("#stand");
const hitButton = document.querySelector("#hit");
const doubleButton = document.querySelector("#double");
const dealButton = document.querySelector("#deal");
const splitButton = document.querySelector("#split");
const playerHands = document.querySelector("#player-hands");
const bettingButtons = document.querySelector("#betting-buttons")
const resetButton = document.querySelector("#reset");

const removeButtons = () => {
    standButton.classList.add('hidden');
    hitButton.classList.add('hidden');
    doubleButton.classList.add('hidden');
    dealButton.classList.remove('hidden');
};

const resetBets = () => {
    GAME.playerBet = 0;
    GAME.splitBet = 0;
    showBid();
};

const showWinnerMessage = (blackjack = 0) => {
    const [sumPointsDealer, sumPointsPlayer, sumPointsSplit] = calculateHands(0);
    message.innerHTML = getWinner(sumPointsDealer, sumPointsPlayer, sumPointsSplit, blackjack);
    resetBets()
    removeButtons();
    bettingButtons.classList.remove('hidden');
};

const showDealerCard = () => {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
}

const showCalculatedHands = (sumPointsDealer, sumPointsPlayer, sumPointsSplit) => {
    dealerPoints.innerHTML = `Points: ${sumPointsDealer}`;
    playerPoints.innerHTML = `Points: ${sumPointsPlayer}`;

    if (sumPointsSplit) {
        playerPoints.innerHTML += ` / ${sumPointsSplit}`;
    }
}

const showCardsLeft = () => {
    countCardsInDeck.innerHTML = `Cards left: ${GAME.deck.length}`;
}

const showBid = () => {
    balance.innerText = `Balance: ${GAME.balance}`;
    bid.innerText = `Current Bet: ${GAME.playerBet}`;
    if (GAME.splitBet) bid.innerText += `/ ${GAME.splitBet}`
}

const setActiveHand = () => {
    const hands = document.querySelectorAll('.player-hand-item');
    for (let index = 0; index < hands.length; index++) {
        hands[index].classList.toggle('active-hand', index === GAME.activeHand);
    }
};

const removePlayingCards = () => {
    const playingCards = document.querySelectorAll('.playing-card-item');
    for (const card of playingCards) {
        card.remove()
    }
};

const resetGame = () => {
    removePlayingCards();
    dealerPoints.innerHTML = '';
    playerPoints.innerHTML = '';
    message.innerHTML = '';
    countCardsInDeck.innerHTML = '';
    bettingButtons.classList.add('hidden');
    standButton.classList.remove('hidden');
    hitButton.classList.remove('hidden');
    doubleButton.classList.remove('hidden');
    dealButton.classList.add('hidden');
    splitButton.classList.add('hidden');
    document.querySelector('.split-hand-item')?.remove();
    if (GAME.deck.length <= Math.round(104 * 0.2)) {
        GAME.initializeDeck();
        message.innerHTML = 'Cards shuffled';
    }
    GAME.dealerHand = [];
    GAME.playerHand = [];
    GAME.splitHand = [];
    GAME.activeHand = 0;
};

const stand = () => {
    if (!GAME.splitHand.length || GAME.activeHand) {
        if (!splitButton.classList.contains('hidden')) splitButton.classList.add('hidden');
        showDealerCard()
        let [sumPointsDealer] = calculateHands(0);

        while (sumPointsDealer < 17) {
            dealCard("dealer-hand");
            sumPointsDealer = calculateHands(0)[0];
        }
        showWinnerMessage();
        return;
    }

    const sumPointsSplit = calculateHands()[2];
    GAME.activeHand = 1;
    setActiveHand();
    doubleButton.classList.remove('hidden');
    if (sumPointsSplit === 21) stand()
};
standButton.addEventListener("click", stand);

const hit = () => {
    doubleButton.classList.add('hidden');
    if (!splitButton.classList.contains('hidden')) splitButton.classList.add('hidden');
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
            const sumPointsSplit = calculateHands()[2];
            if (sumPointsSplit === 21) stand()
            return;
        }
        showDealerCard()
        showWinnerMessage();
    }
};
hitButton.addEventListener("click", hit);

const double = () => {
    if (GAME.balance - GAME.playerBet < 0){
        return alert('Not enough chips');
    }
    if (!GAME.activeHand) {
        dealCard("player-hand");
        GAME.balance -= GAME.playerBet;
        GAME.playerBet *= 2;
    } else {
        dealCard("split-hand");
        GAME.balance -= GAME.splitBet;
        GAME.splitBet *= 2;
    }
    showBid()
    stand()
};
doubleButton.addEventListener("click", double);

const split = () => {
    if (GAME.balance - GAME.playerBet < 0){
        return alert('Not enough chips')
    }

    GAME.splitHand = [GAME.playerHand.pop()];
    GAME.balance -= GAME.playerBet;
    GAME.splitBet = GAME.playerBet
    updateBet()

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

};
splitButton.addEventListener("click", split);

const deal = () => {
    if (GAME.playerBet === 0) {
        return alert("Place a bet");
    }
    resetGame();
    startGame();
};
dealButton.addEventListener("click", deal);

document.querySelectorAll('.bet-button').forEach(button => {
    button.addEventListener('click', () => {
        const betAmount = parseInt(button.getAttribute('data-bet'));
        updateBet(betAmount);
    });
});

const resetBet = () => {
    console.log(1)
    GAME.balance += GAME.playerBet;
    GAME.playerBet = 0;
    GAME.splitBet = 0;
    showBid()
};
resetButton.addEventListener('click', resetBet)

export { removeButtons, showWinnerMessage, showCalculatedHands, setActiveHand, removePlayingCards, showBid,
    stand, hit, double, split, deal, showCardsLeft, showDealerCard };
