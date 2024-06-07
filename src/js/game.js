'use strict';

import { showCalculatedHands, showBid, showCardsLeft } from './ui.js';

const GAME = {
    suits: ['h', 'd', 'c', 's'],
    values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'],
    deck: [],
    activeHand: 0,
    dealerHand: [],
    playerHand: [],
    splitHand: [],
    balance: 1000,
    playerBet: 0,
    splitBet: 0,

    initializeDeck() {
        const deck = this.suits.reduce((deckAcc, suit) => {
            for (const value of this.values) {
                deckAcc.push({ value, suit });
            }
            return deckAcc;
        }, []);

        deck.push(...deck);
        const shuffleDeck = (deck) => {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        };

        shuffleDeck(deck);
        this.deck = deck;
    }
};

const dealCard = (hand, visibility = 1) => {
    const card = GAME.deck.pop();
    showCardsLeft()

    if (hand === 'dealer-hand') {
        GAME.dealerHand.push(card);
    } else if (hand === 'split-hand') {
        GAME.splitHand.push(card);
    } else {
        GAME.playerHand.push(card);
    }

    const cardImageName = `${card.value}_${card.suit}`;
    let invisible = '';
    if (!visibility) {
        invisible = 'invisible';
    }

    calculateHands();

    const ol = document.getElementsByClassName(hand)[0];
    ol.innerHTML += `<li id="card${visibility + 1}" class="playing-card-item ${invisible}">
    <img src="src/cards/${cardImageName}.png" class="playing-card-image" alt="${cardImageName}">
  </li>`;
};

const dealCards = () => {
    for (let i = 0; i < 2; i++) {
        if (i === 1) {
            dealCard('dealer-hand', 0);
            continue;
        }
        dealCard('dealer-hand');
    }
    for (let i = 0; i < 2; i++) {
        dealCard('player-hand');
    }

    return calculateHands();
};

const calculateHands = (noStand = 1) => {
    const calculatingPoints = (hand) => {
        let sum = 0;
        let aces = 0;

        for (const card of hand) {
            if (card.value === 'a') {
                aces++;
                if (sum + 11 > 21) {
                    sum++;
                    aces--;
                } else {
                    sum += 11;
                }
            } else if (['j', 'q', 'k'].includes(card.value)) {
                sum += 10;
            } else {
                sum += parseInt(card.value);
            }
            if (hand === GAME.dealerHand && noStand) {
                return sum;
            }
        }
        if (sum > 21 && aces) {
            sum -= 11;
            sum++;
            aces--;
        }

        return sum;
    };

    const sumPointsDealer = calculatingPoints(GAME.dealerHand);
    const sumPointsPlayer = calculatingPoints(GAME.playerHand);

    if (GAME.splitHand.length) {
        const sumPointsSplit = calculatingPoints(GAME.splitHand);
        showCalculatedHands(sumPointsDealer, sumPointsPlayer, sumPointsSplit)
        return [sumPointsDealer, sumPointsPlayer, sumPointsSplit];
    }

    showCalculatedHands(sumPointsDealer, sumPointsPlayer)
    return [sumPointsDealer, sumPointsPlayer];
};

const getWinner = (sumPointsDealer, sumPointsPlayer, sumPointsSplit, blackjack) => {
    const createMessage = (sumPointsDealer, hand, blackjack, bid) => {
        if (blackjack && sumPointsDealer !== 21) {
            GAME.balance += (bid * 2) + bid/ 2;
            return 'Player wins x2.5(Blackjack)';
        } else if (blackjack){
            GAME.balance += bid;
            return 'Push x1';
        }

        if (hand > 21) {
            return 'Dealer wins (bust)';
        }
        if (sumPointsDealer <= 21) {
            if (hand > sumPointsDealer) {
                GAME.balance += bid * 2;
                return 'Player wins x2';
            } else if (hand < sumPointsDealer) {
                return 'Dealer wins';
            } else {
                GAME.balance += bid;
                return 'Push x1';
            }
        } else {
            GAME.balance += bid * 2;
            return 'Player wins x2 (bust)';
        }
    };

    let resultMessage = '';

    if (sumPointsSplit !== undefined) {
        resultMessage += createMessage(sumPointsDealer, sumPointsPlayer, blackjack, GAME.playerBet) + ' / ';
        resultMessage += createMessage(sumPointsDealer, sumPointsSplit, blackjack, GAME.splitBet);
    } else {
        resultMessage += createMessage(sumPointsDealer, sumPointsPlayer, blackjack, GAME.playerBet);
    }

    return resultMessage;
};

const updateBet = (amount=0) => {
    if (GAME.balance - amount >= 0) {
        GAME.balance -= amount;
        GAME.playerBet += amount;
        showBid()
        return;
    }
    alert('Not enough chips')
};

export { GAME, dealCard, dealCards, calculateHands, getWinner, updateBet };
