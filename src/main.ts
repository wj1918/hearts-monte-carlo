// main.ts
import './style.css'
import './card.css'
import { HeartsGame, log } from './hearts'

var game = new HeartsGame(['Alice', 'Bob', 'Carol', 'Dave']);
const simSlider = document.getElementById('simRange') as HTMLInputElement;
const simLabel = document.getElementById('simCount')!;
simSlider.addEventListener('input', () => {
  simLabel.textContent = simSlider.value;
});

const continueBtn = document.getElementById('continueBtn')! as HTMLInputElement;
continueBtn.disabled = true;

const startBtn = document.getElementById('startBtn')! as HTMLInputElement
startBtn!.addEventListener('click', async () => {
  startBtn.disabled = true;

  const pauseCheckbox = document.getElementById('pauseTrick') as HTMLInputElement;
  if (pauseCheckbox.checked) {
    continueBtn.disabled = false;
  }
  pauseCheckbox.disabled = true;
  const numSims = parseInt(simSlider.value);
  (document.getElementById("gameLog")!).innerHTML = ""
  log(`Starting Hearts Game with ${numSims} Monte Carlo sims per move...`);
  await game.playRound(numSims);
  continueBtn.disabled = true;

  log(`<br>🏁 Round finished.`);
});

game.deal()

