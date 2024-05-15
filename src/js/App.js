'use strict';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'J', 'Q', 'K', 'A'];


const initializeDeck = () => {
  const deck = [];
  const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  };

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ value, suit });
    }
  }
  shuffleDeck(deck);

  return deck;
};

const DECK = initializeDeck();

const dealCard = () => DECK.pop();

const calculateHand = (hand) => {
  let sum = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      if (sum + 11 > 21) {
        sum++;
      } else sum += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }
  return sum;
};

const playerHand = [dealCard(), dealCard()];
const dealerHand = [dealCard(), dealCard()];

console.log(`Player hand: ${playerHand[0].value} ${playerHand[0].suit} and ${playerHand[1].value} ${playerHand[1].suit}`);

console.log(`Dealer hand: ${dealerHand[0].value} ${dealerHand[0].suit} and ${dealerHand[1].value} ${dealerHand[1].suit}`);

console.log(`Player sum: ${calculateHand(playerHand)}`);
console.log(`Dealer sum: ${calculateHand(dealerHand)}`);