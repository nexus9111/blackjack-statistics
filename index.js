const NUMBER_OF_GAMES = 100_000;
const BET_AMOUNT = 5;
const STARTING_WALLET = 50;
const TARGET_WALLET = 100;

class BlackJackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
    }

    async play() {
        let startingWallet = STARTING_WALLET;
        let target = TARGET_WALLET;
        while (startingWallet > 0 && startingWallet < target) {
            this.deck = this.createDeck();
            this.playerHand = this.dealCards(2);
            this.dealerHand = this.dealCards(1);
            let playerResult = await this.playerTurn();
            this.dealerHand.push(this.dealCards(1)[0]);
            let dealerResult = await this.dealerTurn();
            let winner = this.compareResults();
            if (winner === 'blackjack') {
                startingWallet += (BET_AMOUNT * 1.5).toFixed(2);
            } else if (winner === 'player') {
                startingWallet += BET_AMOUNT;
            } else if (winner === 'dealer') {
                startingWallet -= BET_AMOUNT;
            }
        }
        return startingWallet >= target ? 'player' : 'dealer';
    }

    createDeck() {
        let deck = [];
        let suits = ['hearts', 'diamonds', 'spades', 'clubs'];
        let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }

        return deck;
    }

    dealCards(numCards) {
        let hand = [];
        for (let i = 0; i < numCards; i++) {
            let index = Math.floor(Math.random() * this.deck.length);
            hand.push(this.deck[index]);
            this.deck.splice(index, 1);
        }
        return hand;
    }

    async playerTurn() {
        // player should hit when the value of the hand is less than 17 and dealer has 7 or more
        // player should stand when the value of the hand is greater than 11 and dealer has less than 7
        let handValue = this.getHandValue(this.playerHand);
        let dealerValue = this.getHandValue(this.dealerHand);
        while (handValue < 21) {
            if (handValue >= 17) {
                break;
            }
            if (dealerValue >= 7) {
                this.playerHand.push(this.dealCards(1)[0]);
                handValue = this.getHandValue(this.playerHand);
            } else {
                if (handValue <= 11) {
                    this.playerHand.push(this.dealCards(1)[0]);
                    handValue = this.getHandValue(this.playerHand);
                } else {
                    break;
                }
            }
        }
        return handValue;
    }

    async dealerTurn() {
        let handValue = this.getHandValue(this.dealerHand);
        while (handValue < 21) {
            if (handValue < 17) {
                this.dealerHand.push(this.dealCards(1)[0]);
                handValue = this.getHandValue(this.dealerHand);
            } else {
                break;
            }
        }
        return handValue;
    }


    compareResults() {
        let playerResult = this.getHandValue(this.playerHand);
        let dealerResult = this.getHandValue(this.dealerHand);
        let playerHasBlackjack = playerResult === 21 && this.playerHand.length === 2;
        let dealerHasBlackjack = dealerResult === 21 && this.dealerHand.length === 2;

        if (playerResult > 21) {
            return 'dealer';
        }

        if (playerHasBlackjack) {
            if (dealerHasBlackjack) {
                return 'draw';
            }
            return 'blackjack';
        }

        if (dealerHasBlackjack) {
            return 'dealer';
        }

        if (playerResult > dealerResult) {
            return 'player';
        }

        if (dealerResult > playerResult) {
            return 'dealer';
        }

        return 'draw';
    }

    getHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (let card of hand) {
            if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
                value += 10;
            } else if (card.value === 'A') {
                value += 11;
                aceCount++;
            } else {
                value += parseInt(card.value);
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }
}

(async () => {
    console.log('Starting game...');
    let numberOfGame = NUMBER_OF_GAMES;
    let promises = [];

    for (let i = 0; i < numberOfGame; i++) {
        let game = new BlackJackGame();
        promises.push(game.play());
    }

    let results = await Promise.all(promises);

    // Calculate the number of wins, draws, and losses
    let counts = results.reduce((acc, result) => {
        acc[result]++;
        return acc;
    }, { player: 0, draw: 0, dealer: 0 });

    // Calculate the percentage of each outcome
    let winPercentage = (counts.player / numberOfGame) * 100;
    let lossPercentage = (counts.dealer / numberOfGame) * 100;

    console.log(`Wins: ${counts.player} (${winPercentage.toFixed(2)}%)`);
    console.log(`Losses: ${counts.dealer} (${lossPercentage.toFixed(2)}%)`);
})();
