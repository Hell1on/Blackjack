'use strict';

const dealerPoints = document.querySelector("#dealer-points");
const playerPoints = document.querySelector("#player-points");
const standButton = document.querySelector("#stand");
const hitButton = document.querySelector("#hit");

const SUITS = ['h', 'd', 'c', 's'];
const VALUES = ['2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'j', 'q', 'k', 'a'];
const DealerHand = [];
const PlayerHand = [];

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
  if (hand === 'dealer-hands'){
    DealerHand.push(card)
  } else PlayerHand.push(card)
  const cardImageName = `${card.value}_${card.suit}`;
  let invisible = '';
  if (!visibility) {
    invisible = 'invisible';
  }

  calculateHands();

  const ol = document.getElementsByClassName(hand)[0];
  ol.innerHTML += `<li id="card${visibility + 1}" class="playing-card-item ${invisible}"> <img src="cards/${cardImageName}.png" alt="${cardImageName}"></li>`
};

const calculateHands = (noStand=1) => {
  const calculatingPoints = (hand) => {
    let sum = 0;

    for (const card of hand) {
      if (card.value === 'a') {
        if (sum + 11 > 21) {
          sum++;
        } else sum += 11;
      } else if (['j', 'q', 'k'].includes(card.value)) {
        sum += 10;
      } else {
        sum += parseInt(card.value);
      }
      if (hand === DealerHand && noStand) {
        return sum;
      }
    }
    return sum
  };

  const sumPointsDealer = calculatingPoints(DealerHand);
  const sumPointsPlayer = calculatingPoints(PlayerHand);
  dealerPoints.innerHTML = `Points: ${sumPointsDealer}`;
  playerPoints.innerHTML = `Points: ${sumPointsPlayer}`;
};

const dealCards = () => {
  for (let i = 0; i < 2; i++) {
    if (i === 1){
      dealCard('dealer-hands', 0);
      continue;
    }
    dealCard('dealer-hands');
  }
  for (let i = 0; i < 2; i++) {
    dealCard('player-hands');
  }

  calculateHands()
}


dealCards()

standButton.addEventListener("click", () => {
  const hideCard = document.getElementsByClassName("invisible")[0];
  hideCard.classList.remove("invisible")
  calculateHands(0)
}, )

