'use strict';

const SUITS = ['h', 'd', 'c', 's'];
const VALUES = ['2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'j', 'q', 'k', 'a'];


const initializeDeck = () => {
  const deck = SUITS.reduce((deckAcc, suit) =>{
    for (const value of VALUES) {
      deckAcc.push({ value, suit })
    }
    return deckAcc
  }, []);

  deck.push(...deck)
  const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  };

  shuffleDeck(deck);

  return deck;
};

const DECK = initializeDeck();

const dealCard = (hand, visibility = 1) => {
  const card = DECK.pop();
  let cardImageName = `${card.value}_${card.suit}`;
  let invisible = '';
  if (!visibility) {
    invisible = 'invisible';
  }

  const ol = document.getElementsByClassName(hand)[0];
  ol.innerHTML += `<li class="playing-card-item ${invisible}"> <img src="cards/${cardImageName}.png" alt="${cardImageName}"></li>`
  return card;
};

const dealCards = () => {
  const dealerHand = [];
  const playerHand = [];

  for (let i = 0; i < 2; i++) {
    if (i === 1){
      dealerHand.push(dealCard('dealer-hands', 0))
      continue;
    }
    dealerHand.push(dealCard('dealer-hands'));
  }
  for (let i = 0; i < 2; i++) {
    playerHand.push(dealCard('player-hands'));
  }

  return [dealerHand, playerHand]
}

const [dealerHand, playerHand] = [...dealCards()]

console.log(dealerHand, playerHand)

const calculateHand = (hand) => {
  let sum = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      if (sum + 11 > 21) {
        sum++;
      } else sum += 11;
    } else if (['j', 'q', 'k'].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }
  return sum;
};

