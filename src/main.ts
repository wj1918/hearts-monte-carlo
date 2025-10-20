// main.ts
import './style.css'
import './card.css'
import { HeartsGame, log } from './hearts'

const game = new HeartsGame(['Alice', 'Bob', 'Carol', 'Dave']);
const simSlider = document.getElementById('simRange') as HTMLInputElement;
const simLabel = document.getElementById('simCount')!;
simSlider.addEventListener('input', () => {
  simLabel.textContent = simSlider.value;
});

document.getElementById('startBtn')!.addEventListener('click', async () => {
  const pauseCheckbox = document.getElementById('pauseTrick') as HTMLInputElement;
  pauseCheckbox.disabled = true;
  const numSims = parseInt(simSlider.value);
  (document.getElementById("gameLog")!).innerHTML = ""
  log(`Starting Hearts Game with ${numSims} Monte Carlo sims per move...`);
  await game.playRound(numSims);
  pauseCheckbox.disabled = false;
  log(`<br>🏁 Round finished.`);
});

