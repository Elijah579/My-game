let score = JSON.parse(localStorage.getItem('score')) || {   //->  // Default operators
    wins: 0,
    losses: 0,
    ties: 0
};

// Rounds persisted
let rounds = parseInt(localStorage.getItem('rounds') || '0', 10);
document.addEventListener('DOMContentLoaded', () => updateRoundsElement());

// Sound enabled state
let soundEnabled = (localStorage.getItem('soundEnabled') || 'true') === 'true';
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('sound-toggle');
    if (btn) {
        btn.textContent = soundEnabled ? '🔊 Sound' : '🔈 Muted';
        btn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('soundEnabled', String(soundEnabled));
            btn.textContent = soundEnabled ? '🔊 Sound' : '🔈 Muted';
            if (!soundEnabled) {
                // Immediately stop any playing audio and clear play flags
                try {
                    stopAllSounds();
                } catch (e) {}
                winSoundPlayed = false;
                loseSoundPlayed = false;
                tieSoundPlayed = false;
            }
        });
    }
});

updateScoreElement();

//if (score === null) {    ->   this could also work

//}

/*
if (!score) {
    score = {
        wins: 0,
        losses: 0,
        ties: 0
    };
}
*/

// Sound state
let winSoundPlayed = false;
let loseSoundPlayed = false;
let tieSoundPlayed = false;

// Win streak
let streak = parseInt(localStorage.getItem('streak') || '0', 10);
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.js-streak'); if (el) el.textContent = String(streak);
});

function playGame(playerMove) {
    // Small UX: highlight selected button and show 'thinking' animation
    stopAllSounds();
    winSoundPlayed = false;
    loseSoundPlayed = false;
    tieSoundPlayed = false;

    highlightPlayerChoice(playerMove);
    showThinking();

    // Delay slightly so player sees selection before result
    setTimeout(() => {
        const computerMove = pickComputerMove();

        let result = '';

    if (playerMove === 'scissors') {
        if (computerMove === 'rock') {
            result = 'You lose.'
        } else if (computerMove === 'paper') {
            result = 'You win.';
        } else if (computerMove === 'scissors') {
            result = 'Tie.';
        }

    } else if (playerMove === 'paper') {
        if (computerMove === 'rock') {
            result = 'You win.'
        } else if (computerMove === 'paper') {
            result = 'Tie.';
        } else if (computerMove === 'scissors') {
            result = 'You lose.';
        }

    } else if (playerMove === 'rock') {
        if (computerMove === 'rock') {
            result = 'Tie.'
        } else if (computerMove === 'paper') {
            result = 'You lose.';
        } else if (computerMove === 'scissors') {
            result = 'You win.';
        }
    }

        if (result === 'You win.') {
            score.wins += 1;
            streak += 1;
            localStorage.setItem('streak', String(streak));
            updateStreakElement();
            animatePlusOne();
            glowWinningButton(playerMove);
        } else if (result === 'You lose.') {
            score.losses += 1;
            streak = 0; localStorage.setItem('streak', '0'); updateStreakElement();
        } else if (result === 'Tie.') {
            score.ties += 1;
            streak = 0; localStorage.setItem('streak', '0'); updateStreakElement();
        }

        // update rounds
        rounds += 1;
        localStorage.setItem('rounds', String(rounds));
        updateRoundsElement();


        localStorage.setItem('score', JSON.stringify(score));

        updateScoreElement();

        document.querySelector('.js-result').innerHTML = result;

        document.querySelector('.js-moves').innerHTML = `        You
        <img src="images/${playerMove}-emoji.png" class="move-icon">
        <img src="images/${computerMove}-emoji.png" class="move-icon">
        Computer`;

        playResultSound();

        // show play again and end thinking
        document.querySelector('.play-again-btn').classList.add('show');
        hideThinking();

        if (result === 'You win.') {
            confettiBurst();
            showVictoryOverlay();
        }
    }, 500);
}

function updateScoreElement() {
    document.querySelector('.js-score').innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Tie: ${score.ties}`;
}

function pickComputerMove() {
    const randomNumber = Math.random();

    let computerMove = '';


    if (randomNumber >= 0 && randomNumber < 1 / 3) {
        computerMove = 'rock';
    } else if (randomNumber >= 1 / 3 && randomNumber < 2 / 3) {
        computerMove = 'paper';
    } else if (randomNumber >= 2 / 3 && randomNumber < 1) {
        computerMove = 'scissors';

    }


    return computerMove;
}

// Animate result text
function animateResult() {
    const resultEl = document.querySelector('.js-result');
    resultEl.classList.add('animated');
    setTimeout(() => resultEl.classList.remove('animated'), 600);
}

// Highlight the player's selected button briefly
function highlightPlayerChoice(move) {
    document.querySelectorAll('.move-button').forEach(btn => btn.classList.remove('selected'));
    const btn = document.querySelector(`.move-button[data-move="${move}"]`);
    if (btn) {
        btn.classList.add('selected');
        setTimeout(() => btn.classList.remove('selected'), 900);
    }
}

// Thinking indicator
function showThinking() {
    const res = document.querySelector('.js-result');
    res.textContent = 'Computer is thinking...';
    res.classList.remove('animated');
}

function hideThinking() {
    const res = document.querySelector('.js-result');
    setTimeout(() => {
        if (res.textContent === 'Computer is thinking...') res.textContent = '';
    }, 100);
}

function playResultSound() {
    const resultText = document.querySelector('.js-result').textContent.toLowerCase();
    if (resultText.includes('win') && !winSoundPlayed) {
        const audioEl = document.getElementById('win-sound');
        audioEl.currentTime = 0;
    if (soundEnabled) audioEl.play().catch(function(e) {});
        winSoundPlayed = true;
    } else if (resultText.includes('lose') && !loseSoundPlayed) {
        const audioEl = document.getElementById('lose-sound');
        audioEl.currentTime = 0;
    if (soundEnabled) audioEl.play().catch(function(e) {});
        loseSoundPlayed = true;
    } else if ((resultText.includes('tie') || resultText.includes('draw')) && !tieSoundPlayed) {
        const audioEl = document.getElementById('tie-sound');
        audioEl.currentTime = 0;
    if (soundEnabled) audioEl.play().catch(function(e) {});
        tieSoundPlayed = true;
    }
}

function stopAllSounds() {
    const winAudio = document.getElementById('win-sound');
    const loseAudio = document.getElementById('lose-sound');
    const tieAudio = document.getElementById('tie-sound');
    winAudio.pause(); winAudio.currentTime = 0;
    loseAudio.pause(); loseAudio.currentTime = 0;
    tieAudio.pause(); tieAudio.currentTime = 0;
}

// Simple confetti using DOM elements (no external libs)
function confettiBurst() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    const colors = ['#ffd700', '#ff4081', '#00e676', '#00bcd4', '#ff9800'];
    for (let i = 0; i < 24; i++) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = el.style.height = Math.random() > 0.5 ? '10px' : '6px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.top = '-10%';
        el.style.opacity = '0.95';
        el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
        el.style.borderRadius = '2px';
        el.style.transition = 'transform 1200ms cubic-bezier(.2,.7,.2,1), top 1200ms linear, opacity 1200ms linear';
        container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.top = 100 + Math.random() * 80 + '%';
            el.style.transform = `translateY(0) rotate(${Math.random()*720}deg) translateX(${(Math.random()-0.5)*200}px)`;
            el.style.opacity = '0';
        });
    }
    setTimeout(() => container.remove(), 1600);
}

// Stop win sound
function stopWinSound() {
    const audioEl = document.getElementById('win-sound');
    audioEl.pause();
    audioEl.currentTime = 0;
}
// Show Play Again button after a move
function playAgain() {
    document.querySelector('.js-result').textContent = '';
    document.querySelector('.js-moves').textContent = '';
    document.querySelector('.play-again-btn').classList.remove('show');
    winSoundPlayed = false; loseSoundPlayed = false; tieSoundPlayed = false; stopAllSounds();
    hideVictoryOverlay();
}
// Patch playGame to show Play Again button, animate result, and play sound
const origPlayGame = window.playGame;
window.playGame = function (move) {
    stopWinSound();
    origPlayGame(move);
    animateResult();
    playResultSound();
    document.querySelector('.play-again-btn').classList.add('show');
};

// Keyboard shortcuts R / P / S
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'r') {
        window.playGame('rock');
    } else if (k === 'p') {
        window.playGame('paper');
    } else if (k === 's') {
        window.playGame('scissors');
    }
});

function updateRoundsElement() {
    const el = document.querySelector('.js-rounds');
    if (el) el.textContent = String(rounds);
}

// Victory overlay and stars
function showVictoryOverlay() {
    const overlay = document.getElementById('victory-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    spawnStars(18);
    // pulse the score briefly
    const scoreEl = document.querySelector('.js-score');
    if (scoreEl) {
        scoreEl.style.transition = 'transform 320ms ease, box-shadow 320ms ease';
        scoreEl.style.transform = 'scale(1.06)';
        scoreEl.style.boxShadow = '0 10px 36px rgba(0,230,118,0.18)';
        setTimeout(() => {
            scoreEl.style.transform = '';
            scoreEl.style.boxShadow = '';
        }, 520);
    }
}

function hideVictoryOverlay() {
    const overlay = document.getElementById('victory-overlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    // remove leftover stars
    document.querySelectorAll('.star').forEach(s => s.remove());
}

function spawnStars(count) {
    const container = document.getElementById('victory-overlay');
    if (!container) return;
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const left = Math.random() * 100;
        star.style.left = left + 'vw';
        star.style.top = (Math.random() * 20 - 10) + 'vh';
        const size = (Math.random() * 10) + 6;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        const delay = Math.random() * 0.35;
        const duration = 1.0 + Math.random() * 0.9;
        star.style.animation = `star-fall ${duration}s ${delay}s linear forwards`;
        container.appendChild(star);
        // cleanup
        setTimeout(() => {
            try { star.remove(); } catch (e) {}
        }, (delay + duration) * 1000 + 200);
    }
}

function updateStreakElement() {
    const el = document.querySelector('.js-streak'); if (el) el.textContent = String(streak);
}

function animatePlusOne() {
    const container = document.querySelector('.plus-one-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'plus-one';
    el.textContent = '+1';
    container.appendChild(el);
    // force layout then animate
    requestAnimationFrame(() => el.classList.add('animate'));
    setTimeout(() => {
        el.classList.remove('animate');
        try { el.remove(); } catch (e) {}
    }, 900);
}

function glowWinningButton(move) {
    const btn = document.querySelector(`.move-button[data-move="${move}"]`);
    if (!btn) return;
    const prev = btn.style.boxShadow;
    btn.style.transition = 'box-shadow 300ms ease, transform 300ms ease';
    btn.style.boxShadow = '0 16px 48px rgba(0,230,118,0.28)';
    btn.style.transform = 'scale(1.12)';
    setTimeout(() => {
        btn.style.boxShadow = prev || '';
        btn.style.transform = '';
    }, 520);
}