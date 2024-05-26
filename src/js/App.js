'use strict';

const dealerPoints = document.querySelector("#dealer-points");
const playerPoints = document.querySelector("#player-points");
const message = document.querySelector("#message")
const countCardsInDeck = document.querySelector("#cards")
const standButton = document.querySelector("#stand");
const hitButton = document.querySelector("#hit");
const doubleButton = document.querySelector("#double");
const dealButton = document.querySelector("#deal");
const splitButton = document.querySelector("#split");
const playerHands = document.querySelector('#player-hands');

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

const dealCard = (hand, visibility = 1) => {
  const card = GAME.deck.pop();
  countCardsInDeck.innerHTML = `Cards left: ${GAME.deck.length}`;
  if (hand === 'dealer-hand'){
    GAME.dealerHand.push(card)
  } else if (hand === 'split-hand') {
    GAME.splitHand.push(card)
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

  if (GAME.splitHand) {
    const sumPointsSplit = calculatingPoints(GAME.splitHand);
    playerPoints.innerHTML += ` / ${sumPointsSplit}`;
    return [sumPointsDealer, sumPointsPlayer, sumPointsSplit]
  }

  return [sumPointsDealer, sumPointsPlayer];
};

const dealCards = () => {
  for (let i = 0; i < 2; i++) {
    if (i === 1){
      dealCard('dealer-hand', 0);
      continue;
    }
    dealCard('dealer-hand');
  }
  for (let i = 0; i < 2; i++) {
    dealCard('player-hand');
  }

  return calculateHands()
}

const removeButtons = () => {
  standButton.classList.add('hidden');
  hitButton.classList.add('hidden');
  doubleButton.classList.add('hidden');
  dealButton.classList.remove('hidden');
}

const checkWinner = () => {
  const [sumPointsDealer, sumPointsPlayer, sumPointsSplit] = calculateHands(0)
  let resultMessage = '';

  const createMessage = (sumPointsDealer, hand) => {
    if (hand === 21 && sumPointsDealer === 21) {
      return 'Push';
    } else if (hand === 21) {
      return 'Player wins(Blackjack)';
    }
    if (hand > 21) {
      return 'Dealer wins(bust)';
    }
    if (sumPointsDealer <= 21) {
      if (hand > sumPointsDealer) {
        return 'Player wins';
      } else if (hand < sumPointsDealer) {
        return 'Dealer wins';
      } else {
        return 'Push';
      }
    } else
      return 'Player wins(bust)';
  }

  if (GAME.splitHand) {
    resultMessage += createMessage(sumPointsDealer, sumPointsPlayer) + ' / ';
    resultMessage += createMessage(sumPointsDealer, sumPointsSplit);
  } else resultMessage += createMessage(sumPointsDealer, sumPointsPlayer);

  message.innerHTML = resultMessage;
  removeButtons();
}

const stand = () => {
  if (!GAME.splitHand || GAME.activeHand) {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible")
    let [sumPointsDealer] = calculateHands(0);

    while (sumPointsDealer < 17) {
      dealCard("dealer-hand");
      sumPointsDealer = calculateHands(0)[0];
    }
    checkWinner()
    return;
  }
  GAME.activeHand = 1;
  setActiveHand();
};
standButton.addEventListener("click", stand);

const hit = () => {
  if (!GAME.activeHand) {
    dealCard("player-hand");
  } else dealCard("split-hand");

  const sumPointsHand = calculateHands()[GAME.activeHand + 1];
  if (sumPointsHand === 21) {
    if (GAME.splitHand && GAME.activeHand === 0) {
      GAME.activeHand = 1;
      setActiveHand();
      return;
    }
    stand()
  }
  if (sumPointsHand > 21) {
    if (GAME.splitHand && GAME.activeHand === 0) {
      GAME.activeHand = 1;
      setActiveHand();
      return;
    }
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
    checkWinner()
  }
};
hitButton.addEventListener("click", hit);

const double = () => {
  dealCard("player-hand");
  stand()
};
doubleButton.addEventListener("click", double);

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

const split = () => {
  if (GAME.playerHand.length === 2) {
    const hand1 = [GAME.playerHand[0]];
    const hand2 = [GAME.playerHand[1]];
    GAME.playerHand.pop()

    GAME.playerHand = hand1;
    GAME.splitHand = hand2;

    const newHandHTML = `
            <li class="player-hand-item split-hand-item">
                <ol class="split-hand playing-card-list">
                    <li class="playing-card-item">
                        <img src="cards/${GAME.splitHand[0].value}_${GAME.splitHand[0].suit}.png" class="playing-card-image" alt="${GAME.splitHand[0].value}_${GAME.splitHand[0].suit}">
                    </li>
                </ol>
            </li>
            `;
    playerHands.innerHTML += newHandHTML;

    const playingCard = document.getElementsByClassName('playing-card-item')[3];
    playingCard.remove()

    dealCard('player-hand');
    dealCard('split-hand');

    calculateHands()
    setActiveHand()
    splitButton.classList.add('hidden');
  }
}
splitButton.addEventListener("click", split);


const removePlayingCards = () => {
  const playingCards = document.querySelectorAll('.playing-card-item');
  playingCards.forEach(card => card.remove());
}


const Game = () => {
  const sumStartPointsPlayer = dealCards(GAME.deck)[1];
  if (sumStartPointsPlayer === 21) {
    const hideCard = document.getElementsByClassName("invisible")[0];
    hideCard.classList.remove("invisible");
    return checkWinner();
  }

  if (sumStartPointsPlayer / 2 === +GAME.playerHand[0].value || (sumStartPointsPlayer / 2 === 10 &&
      [GAME.playerHand[0].value, GAME.playerHand[1].value].every(value => ['10', 'j', 'q', 'k', 'a'].includes(value)))) {
    splitButton.classList.remove('hidden');
  }
};

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
  splitButton.classList.add('hidden');//!!!
  const splitHand = document.getElementsByClassName('split-hand-item')[0];
  if (splitHand !== undefined) splitHand.remove()

  if (GAME.deck.length <= Math.round(104 * 0.2 )) {
    GAME.deck = [];
    GAME.deck = initializeDeck();
    message.innerHTML = 'Cards shuffled';
  }
  GAME.dealerHand = [];
  GAME.playerHand = [];
  delete GAME.splitHand
  GAME.activeHand = 0

  Game()
}
dealButton.addEventListener("click", restart);


const GAME = {
  deck: initializeDeck(),
  activeHand: 0,
  dealerHand: [],
  playerHand: [],
};

Game()

