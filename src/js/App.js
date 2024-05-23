'use strict';

const dealerPoints = document.querySelector("#dealer-points");
const playerPoints = document.querySelector("#player-points");
const message = document.querySelector("#message")
const standButton = document.querySelector("#stand");
const hitButton = document.querySelector("#hit");
const doubleButton = document.querySelector("#double");
const dealButton = document.querySelector("#deal");

const SUITS = ['h', 'd', 'c', 's'];
const VALUES = ['2', '3', '4', '5', '6', '7',
  '8', '9', '10', 'j', 'q', 'k', 'a'];
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

const dealCard = (hand, visibility = 1) => {
  const card = GAME.deck.pop();
  if (hand === 'dealer-hands'){
    GAME.dealerHand.push(card)
  } else GAME.playerHand.push(card)
  const cardImageName = `${card.value}_${card.suit}`;
  let invisible = '';
  if (!visibility) {
    invisible = 'invisible';
  }

  calculateHands();

  const ol = document.getElementsByClassName(hand)[0];
  ol.innerHTML += `<li id="card${visibility + 1}" class="playing-card-item ${invisible}">
    <img src="cards/${cardImageName}.png" class="playing-card-image" alt="${cardImageName}">
  </li>`

};

const calculateHands = (noStand=1) => {
  const calculatingPoints = (hand) => {
    let sum = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'a') {
        aces++;
        if (sum + 11 > 21) {
          sum++;
          aces--;
        } else sum += 11;
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

    return sum
  };

  const sumPointsDealer = calculatingPoints(GAME.dealerHand);
  const sumPointsPlayer = calculatingPoints(GAME.playerHand);
  dealerPoints.innerHTML = `Points: ${sumPointsDealer}`;
  playerPoints.innerHTML = `Points: ${sumPointsPlayer}`;

  return [sumPointsDealer, sumPointsPlayer];
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

  return calculateHands()
}

const removeButtons = () => {
  standButton.classList.add('hidden');
  hitButton.classList.add('hidden');
  doubleButton.classList.add('hidden');
  dealButton.classList.remove('hidden');
}

const checkWinner = (sumPointsDealer, sumPointsPlayer) => {
  if (sumPointsPlayer === 21) {
    message.innerHTML = 'Player wins(Blackjack)';
    removeButtons();
    return;
  } else if (sumPointsPlayer === 21 && sumPointsDealer === 21) {
    message.innerHTML = 'Push';
    removeButtons();
    return;
  }
  if (sumPointsPlayer > 21) {
    message.innerHTML = 'Dealer wins(bust)';
    removeButtons();
    return;
  }
  if (sumPointsDealer <= 21) {
    if (sumPointsPlayer > sumPointsDealer && sumPointsPlayer <= 21) {
      message.innerHTML = 'Player wins';
      removeButtons();
      return;
    } else if (sumPointsPlayer < sumPointsDealer) {
      message.innerHTML = 'Dealer wins';
      removeButtons();
      return;
    } else
      message.innerHTML = 'Push';
      removeButtons();
      return;
  } else
    message.innerHTML = 'Player wins(bust)';
    removeButtons();
}

const stand = () => {
  const hideCard = document.getElementsByClassName("invisible")[0];
  hideCard.classList.remove("invisible")

  let [sumPointsDealer, sumPointsPlayer] = calculateHands(0);
  while (sumPointsDealer < 17) {
    dealCard("dealer-hands");
    sumPointsDealer = calculateHands(0)[0];
  }
  checkWinner(sumPointsDealer, sumPointsPlayer)
}
standButton.addEventListener("click", stand);

const hit = () => {
  dealCard("player-hands");
  let [sumPointsDealer, sumPointsPlayer] = calculateHands();
  if (sumPointsPlayer >= 21) {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
    [sumPointsDealer, sumPointsPlayer] = calculateHands(0);
    checkWinner(sumPointsDealer, sumPointsPlayer)
  }
}
hitButton.addEventListener("click", hit);

const double = () => {
  dealCard("player-hands");
  stand()
}
doubleButton.addEventListener("click", double);

const removePlayingCards = () => {
  const playingCards = document.querySelectorAll('.playing-card-item');
  playingCards.forEach(card => card.remove());
}


const Game = () => {
  console.log(GAME.deck.length)
  let [sumStartPointsDealer, sumStartPointsPlayer] = dealCards(GAME.deck);
  if (sumStartPointsPlayer === 21) {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
    [sumStartPointsDealer, sumStartPointsPlayer] = dealCards(GAME.deck);
    return checkWinner(sumStartPointsDealer, sumStartPointsPlayer);
  }
};

const restart = () => {
  removePlayingCards();

  // Сброс очков и сообщений
  dealerPoints.innerHTML = '';
  playerPoints.innerHTML = '';
  message.innerHTML = '';

  standButton.classList.remove('hidden');
  hitButton.classList.remove('hidden');
  doubleButton.classList.remove('hidden');
  dealButton.classList.add('hidden');

  if (GAME.deck.length <= 104 * 0.2 ) {
    GAME.deck = [];
    GAME.deck = initializeDeck();
    message.innerHTML = 'Cards shuffled';
  }
  GAME.dealerHand = [];
  GAME.playerHand = [];

  Game()
}
dealButton.addEventListener("click", restart);


const GAME = {
  deck: initializeDeck(),
  dealerHand: [],
  playerHand: [],
};


Game()

