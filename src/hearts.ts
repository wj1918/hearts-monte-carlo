import type { ReturnDocument } from "mongodb";

function waitForContinue(): Promise<void> {
  return new Promise(resolve => {
    const btn = document.getElementById('continueBtn')!;
    const handler = () => {
      btn.removeEventListener('click', handler);
      resolve();
    };
    btn.addEventListener('click', handler);
  });
}
function renderHands(players: Player[]) {
  for (let i = 0; i < 4; i++) {
  const handDiv = document.getElementById(`hand-${i}`);
    if (!handDiv) continue;
    // Sort hand by suit then rank
    const suitOrder: Suit[] = ['♣', '♦', '♥', '♠'];
    const rankOrder: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const sortedHand = [...players[i].hand].sort((a, b) => {
      const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      if (suitDiff !== 0) return suitDiff;
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
    handDiv.innerHTML = sortedHand.map((card, idx) => `
      <div class="card ${card.suit}${card.rank} up bottom" >
        <div class="faceup" title="${card.suit}${card.rank}"></div>
      </div>
    `).join(' ');
  }
}

function renderTrick(player: Player, card: Card) {
  const trickDiv = document.getElementById(`trick-${player.id}`);
  if (!trickDiv) return;
  trickDiv.innerHTML = `
    <div class="card ${card.suit}${card.rank} up bottom" >
      <div class="faceup" title="${card.suit}${card.rank}"></div>
    </div>
  `;
}


type Suit = '♣' | '♦' | '♥' | '♠';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

function createDeck(): Card[] {
  const suits: Suit[] = ['♣', '♦', '♥', '♠'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return suits.flatMap(suit =>
    ranks.map((rank, i) => ({ suit, rank, value: i + 2 }))
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function log(msg: string) {
  const div = document.getElementById("gameLog")!;
  div.innerHTML += msg + "<br>"
  div.scrollTop = div.scrollHeight;
}

class Player {
  name: string;
  hand: Card[] = [];
  score = 0;
  id: number;
  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }

  legalCards(leadSuit: Suit | null, heartsBroken: boolean): Card[] {
    if (!leadSuit) {
      const nonHearts = this.hand.filter(c => c.suit !== '♥');
      if (nonHearts.length > 0 && !heartsBroken) return nonHearts;
      return this.hand;
    } else {
      const sameSuit = this.hand.filter(c => c.suit === leadSuit);
      return sameSuit.length > 0 ? sameSuit : this.hand;
    }
  }

  playCardMonteCarlo(trick: Card[], heartsBroken: boolean, remaining: Card[], numSims: number): Card {
    const leadSuit = trick.length > 0 ? trick[0].suit : null;
    const legal = this.legalCards(leadSuit, heartsBroken);
    if (legal.length === 1) {
      const card = legal[0];
      this.removeCard(card);
      return card;
    }

    let bestCard = legal[0];
    let bestExpected = Infinity;

    for (const card of legal) {
      let totalScore = 0;
      for (let s = 0; s < numSims; s++) {
        const simDeck = shuffle([...remaining]);
        const simTrick = [...trick, card];
        const randomOther = simDeck.slice(0, 4 - simTrick.length);
        simTrick.push(...randomOther);

        const leadSuitSim = simTrick[0].suit;
        const valid = simTrick.filter(c => c.suit === leadSuitSim);
        const winner = valid.reduce((max, c) => c.value > max.value ? c : max);
        const winnerIsSelf = (winner.suit === card.suit && winner.rank === card.rank);

        let penalty = 0;
        for (const c of simTrick) {
          if (c.suit === '♥') penalty += 1;
          if (c.suit === '♠' && c.rank === 'Q') penalty += 13;
        }
        if (!winnerIsSelf) penalty *= 0.3;
        totalScore += penalty;
      }
      const expected = totalScore / numSims;
      if (expected < bestExpected) {
        bestExpected = expected;
        bestCard = card;
      }
    }
    this.removeCard(bestCard);
    return bestCard;
  }

  removeCard(card: Card) {
    const idx = this.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (idx >= 0) this.hand.splice(idx, 1);
  }
}

export class HeartsGame {
  players: Player[];
  deck: Card[];
  heartsBroken = false;
  playedCards: Card[] = [];

  constructor(names: string[]) {
    this.players = names.map((n, i) => new Player(n, i));
    this.deck = createDeck();
  }

  deal() {
    this.deck = shuffle(createDeck());
    for (const p of this.players) p.hand = [];
    for (let i = 0; i < 52; i++) {
      this.players[i % 4].hand.push(this.deck[i]);
    }
    renderHands(this.players);
  }


  async playRound(numSims: number) {
    this.deal();
    this.heartsBroken = false;
    this.playedCards = [];
    const leader = this.findPlayerWithCard('♣', '2');
    let currentLeader = leader;
    const pauseCheckbox = document.getElementById('pauseTrick') as HTMLInputElement;

    for (let trickNum = 0; trickNum < 13; trickNum++) {
      const trick: { player: Player; card: Card }[] = [];

      for (let j = 0; j < 4; j++) {
        const player = this.players[(currentLeader + j) % 4];
        const card = player.playCardMonteCarlo(
          trick.map(t => t.card),
          this.heartsBroken,
          this.remainingCards(player),
          numSims
        );
        if (card.suit === '♥') this.heartsBroken = true;
        trick.push({ player, card });
        this.playedCards.push(card);
        log(`${player.name} plays ${card.rank}${card.suit}`);
        renderHands(this.players);
        renderTrick(player,card);
        await new Promise(r => setTimeout(r, 100));
      }

      const leadSuit = trick[0].card.suit;
      const valid = trick.filter(t => t.card.suit === leadSuit);
      const winner = valid.reduce((max, t) => t.card.value > max.card.value ? t : max);
      currentLeader = this.players.indexOf(winner.player);
      log(`🂠 Trick winner: ${winner.player.name}<br>`);

      if (pauseCheckbox && pauseCheckbox.checked) {
        await waitForContinue();
      }
    }

    for (const p of this.players) {
      let pts = 0;
      for (const c of this.playedCards.filter((_, i) => i % 4 === p.id)) {
        if (c.suit === '♥') pts += 1;
        if (c.suit === '♠' && c.rank === 'Q') pts += 13;
      }
      p.score += pts;
      log(`${p.name} total points: ${p.score}`);
    }
  }

  findPlayerWithCard(suit: Suit, rank: Rank): number {
    return this.players.findIndex(p => p.hand.some(c => c.suit === suit && c.rank === rank));
  }

  remainingCards(excludePlayer: Player): Card[] {
    const known = new Set(this.playedCards.map(c => `${c.suit}${c.rank}`));
    for (const p of this.players) {
      if (p !== excludePlayer)
        for (const c of p.hand)
          known.add(`${c.suit}${c.rank}`);
    }
    return createDeck().filter(c => !known.has(`${c.suit}${c.rank}`));
  }
}

