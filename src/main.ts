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
  const numSims = parseInt(simSlider.value);
  (document.getElementById("gameLog")!).innerHTML = ""
  log(`Starting Hearts Game with ${numSims} Monte Carlo sims per move...`);
  await game.playRound(numSims);
  log(`<br>🏁 Round finished.`);
});

