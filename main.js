var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
function createDeck() {
    var suits = ['♣', '♦', '♥', '♠'];
    var ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap(function (suit) {
        return ranks.map(function (rank, i) { return ({ suit: suit, rank: rank, value: i + 2 }); });
    });
}
function shuffle(arr) {
    var _a;
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [arr[j], arr[i]], arr[i] = _a[0], arr[j] = _a[1];
    }
    return arr;
}
function log(msg) {
    var div = document.getElementById("gameLog");
    div.innerHTML += msg + "<br>";
    div.scrollTop = div.scrollHeight;
}
var Player = /** @class */ (function () {
    function Player(name, id) {
        this.hand = [];
        this.score = 0;
        this.name = name;
        this.id = id;
    }
    Player.prototype.legalCards = function (leadSuit, heartsBroken) {
        if (!leadSuit) {
            var nonHearts = this.hand.filter(function (c) { return c.suit !== '♥'; });
            if (nonHearts.length > 0 && !heartsBroken)
                return nonHearts;
            return this.hand;
        }
        else {
            var sameSuit = this.hand.filter(function (c) { return c.suit === leadSuit; });
            return sameSuit.length > 0 ? sameSuit : this.hand;
        }
    };
    Player.prototype.playCardMonteCarlo = function (trick, heartsBroken, remaining, numSims) {
        var leadSuit = trick.length > 0 ? trick[0].suit : null;
        var legal = this.legalCards(leadSuit, heartsBroken);
        if (legal.length === 1) {
            var card = legal[0];
            this.removeCard(card);
            return card;
        }
        var bestCard = legal[0];
        var bestExpected = Infinity;
        for (var _i = 0, legal_1 = legal; _i < legal_1.length; _i++) {
            var card = legal_1[_i];
            var totalScore = 0;
            var _loop_1 = function (s) {
                var simDeck = shuffle(__spreadArray([], remaining, true));
                var simTrick = __spreadArray(__spreadArray([], trick, true), [card], false);
                var randomOther = simDeck.slice(0, 4 - simTrick.length);
                simTrick.push.apply(simTrick, randomOther);
                var leadSuitSim = simTrick[0].suit;
                var valid = simTrick.filter(function (c) { return c.suit === leadSuitSim; });
                var winner = valid.reduce(function (max, c) { return c.value > max.value ? c : max; });
                var winnerIsSelf = (winner.suit === card.suit && winner.rank === card.rank);
                var penalty = 0;
                for (var _a = 0, simTrick_1 = simTrick; _a < simTrick_1.length; _a++) {
                    var c = simTrick_1[_a];
                    if (c.suit === '♥')
                        penalty += 1;
                    if (c.suit === '♠' && c.rank === 'Q')
                        penalty += 13;
                }
                if (!winnerIsSelf)
                    penalty *= 0.3;
                totalScore += penalty;
            };
            for (var s = 0; s < numSims; s++) {
                _loop_1(s);
            }
            var expected = totalScore / numSims;
            if (expected < bestExpected) {
                bestExpected = expected;
                bestCard = card;
            }
        }
        this.removeCard(bestCard);
        return bestCard;
    };
    Player.prototype.removeCard = function (card) {
        var idx = this.hand.findIndex(function (c) { return c.suit === card.suit && c.rank === card.rank; });
        if (idx >= 0)
            this.hand.splice(idx, 1);
    };
    return Player;
}());
var HeartsGame = /** @class */ (function () {
    function HeartsGame(names) {
        this.heartsBroken = false;
        this.playedCards = [];
        this.players = names.map(function (n, i) { return new Player(n, i); });
        this.deck = createDeck();
    }
    HeartsGame.prototype.deal = function () {
        this.deck = shuffle(createDeck());
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            p.hand = [];
        }
        for (var i = 0; i < 52; i++) {
            this.players[i % 4].hand.push(this.deck[i]);
        }
    };
    HeartsGame.prototype.playRound = function (numSims) {
        return __awaiter(this, void 0, void 0, function () {
            var leader, currentLeader, _loop_2, this_1, trickNum, _loop_3, this_2, _i, _a, p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.deal();
                        this.heartsBroken = false;
                        this.playedCards = [];
                        leader = this.findPlayerWithCard('♣', '2');
                        currentLeader = leader;
                        _loop_2 = function (trickNum) {
                            var trick, j, player, card, leadSuit, valid, winner;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        trick = [];
                                        j = 0;
                                        _c.label = 1;
                                    case 1:
                                        if (!(j < 4)) return [3 /*break*/, 4];
                                        player = this_1.players[(currentLeader + j) % 4];
                                        card = player.playCardMonteCarlo(trick.map(function (t) { return t.card; }), this_1.heartsBroken, this_1.remainingCards(player), numSims);
                                        if (card.suit === '♥')
                                            this_1.heartsBroken = true;
                                        trick.push({ player: player, card: card });
                                        this_1.playedCards.push(card);
                                        log("".concat(player.name, " plays ").concat(card.rank).concat(card.suit));
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 100); })];
                                    case 2:
                                        _c.sent();
                                        _c.label = 3;
                                    case 3:
                                        j++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        leadSuit = trick[0].card.suit;
                                        valid = trick.filter(function (t) { return t.card.suit === leadSuit; });
                                        winner = valid.reduce(function (max, t) { return t.card.value > max.card.value ? t : max; });
                                        currentLeader = this_1.players.indexOf(winner.player);
                                        log("\uD83C\uDCA0 Trick winner: ".concat(winner.player.name, "<br>"));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        trickNum = 0;
                        _b.label = 1;
                    case 1:
                        if (!(trickNum < 13)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(trickNum)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        trickNum++;
                        return [3 /*break*/, 1];
                    case 4:
                        _loop_3 = function (p) {
                            var pts = 0;
                            for (var _d = 0, _e = this_2.playedCards.filter(function (_, i) { return i % 4 === p.id; }); _d < _e.length; _d++) {
                                var c = _e[_d];
                                if (c.suit === '♥')
                                    pts += 1;
                                if (c.suit === '♠' && c.rank === 'Q')
                                    pts += 13;
                            }
                            p.score += pts;
                            log("".concat(p.name, " total points: ").concat(p.score));
                        };
                        this_2 = this;
                        for (_i = 0, _a = this.players; _i < _a.length; _i++) {
                            p = _a[_i];
                            _loop_3(p);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    HeartsGame.prototype.findPlayerWithCard = function (suit, rank) {
        return this.players.findIndex(function (p) { return p.hand.some(function (c) { return c.suit === suit && c.rank === rank; }); });
    };
    HeartsGame.prototype.remainingCards = function (excludePlayer) {
        var known = new Set(this.playedCards.map(function (c) { return "".concat(c.suit).concat(c.rank); }));
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p !== excludePlayer)
                for (var _b = 0, _c = p.hand; _b < _c.length; _b++) {
                    var c = _c[_b];
                    known.add("".concat(c.suit).concat(c.rank));
                }
        }
        return createDeck().filter(function (c) { return !known.has("".concat(c.suit).concat(c.rank)); });
    };
    return HeartsGame;
}());
var game = new HeartsGame(['Alice', 'Bob', 'Carol', 'Dave']);
var simSlider = document.getElementById('simRange');
var simLabel = document.getElementById('simCount');
simSlider.addEventListener('input', function () {
    simLabel.textContent = simSlider.value;
});
document.getElementById('startBtn').addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
    var numSims;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numSims = parseInt(simSlider.value);
                (document.getElementById("gameLog")).innerHTML = "";
                log("Starting Hearts Game with ".concat(numSims, " Monte Carlo sims per move..."));
                return [4 /*yield*/, game.playRound(numSims)];
            case 1:
                _a.sent();
                log("<br>\uD83C\uDFC1 Round finished.");
                return [2 /*return*/];
        }
    });
}); });
