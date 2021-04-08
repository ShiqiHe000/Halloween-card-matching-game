class AudioController {
    constructor() {
        this.bgMusic = new Audio('audio/creepy.mp3');
        this.flipSound = new Audio('audio/flip.wav');
        this.gameOverSound = new Audio('audio/gameOver.wav');
        this.matchSound = new Audio('audio/match.wav');
        this.victorySound = new Audio('audio/victory.wav');
        this.bgMusic.volume = .2;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic(){
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip(){
        this.flipSound.play();
    }

    match() {
        this.matchSound.play();
    }

    victory() {
        this.stopMusic();
        this.victorySound.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    startGame(){
        this.cardToCheck = null;
        this.timeRemaining = this.totalTime;
        this.totalClicks = 0;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards();
            this.countdown = this.startCountdown();
            this.busy = false;

        }, 500);
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }

    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining <= 0 ) this.gameOver();
        }, 1000);   
    }

    gameOver() {
        clearInterval(this.countdown);  // stop counting down
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }

    victory(){
        clearInterval(this.countdown);  // stop counting down
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');

    }

    // flip the cards to its back
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        })
    }

    flipCard(card) {
        if(!this.canFlipCard(card)) return;

        this.audioController.flip();
        this.totalClicks++;
        this.ticker.innerText = this.totalClicks;   // set the flips
        card.classList.add('visible');  // flip the card

        // match? 
        if(this.cardToCheck){
            // check for a match
            this.checkForCardMatch(card);
        } else {
            this.cardToCheck = card;
        }
    }

    checkForCardMatch(card){
        if (this.getCardType(card) === this.getCardType(this.cardToCheck)) {
            // match
            this.cardMatch(card, this.cardToCheck);
        } else {
            this.cardMismatch(card, this.cardToCheck);
        }

        this.cardToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        // check for victory
        if(this.matchedCards.length == this.cardsArray.length) this.victory();

    }

    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.querySelector('[data-card-value]').src;

    }

    shuffleCards(){
        for(let i = this.cardsArray.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            this.cardsArray[i].style.order = j;
            this.cardsArray[j].style.order = i;
        }
    }

    canFlipCard(card) {
        // return true;
        return (!this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck);
    }
}

const overlayText = document.querySelectorAll('[data-overlay-text]');
const cards = document.querySelectorAll('[data-card]');

const GAME_TOTAL_TIME = 100;

// game audio and game
let audioController = new AudioController();
let game = new MixOrMatch(GAME_TOTAL_TIME, cards);

ready();

function ready() {

    startOverlay();

    cardFunc();
}

function startOverlay(){
    overlayText.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        })
    })
}

function cardFunc(){
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);

        })
    })
}