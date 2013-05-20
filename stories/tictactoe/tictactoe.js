// This code includes the infrastructure to play a game of
// tic-tac-toe, along with a few "players".
//
// The structure of the player borrows heavily from Peter Norvig's
// Othello code in the "Principles of Artificial Intelligence
// Programming".  http://norvig.com/paip/othello.lisp
//
// A lot of this was a learning project, so take the code with a grain
// of salt.

const module_objects = {};

const RED = 1,
      BLUE = 2,
      TWOPI = 2 * Math.PI;

// Colors for the players.
// Current colors from color brewer http://colorbrewer2.org/

const colorMap = new Map([
    [RED, '#e41a1c'],
    [BLUE, '#377eb8']]);

/// Randomly shuffle the elements of an array.
function shuffleArray(array) {
    // Use Knuth's Algorithm P to shuffle the array.
    const N = array.length;
    for(let i = N - 1; i > -1; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/// Return the opponent of the given player.
const opponentMap = new Map([[BLUE, RED], [RED, BLUE]]);

function getOpponent(player) {
    const r = opponentMap.get(player);
    if (r === undefined) {
        throw 'impossible';
    }
    return r;
}

const symbolMap = new Map([[RED, 'X'], [BLUE, 'O']]);

/// Get the symbol for a player for the text based board.
function getSymbol(player) {
    const r = symbolMap.get(player);
    if (r === undefined) {
        return '';
    }
    return r;
}

// Helper data structure to represent moves and handle
// conversions.
class Move {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    toIdx() {
        return this.row * 3 + this.col;
    }
}

// Data structure to hold the game state and provide some helper
// functions.
class Board {
    constructor() {
        this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.player = RED;
    }
    copy() {
        const result = new Board();
        result.data = this.data.slice();
        result.player = this.player;
        return result;
    }
    toString() {
        let result = "",
            lookup = {0: '.', 1: 'X', 2: 'O'};
        for(let r = 0; r < 3; r += 1) {
            for(let c = 0; c < 3; c += 1) {
                result += lookup[this.data[r*3 + c]];
            }
            result += "\n";
        }
        return result;
    }
    // Return the value on the board.
    get(row, col) {
        const idx = row * 3 + col;
        return this.data[idx];
    }

    // Get all of the open positions on the board.
    getMoves() {
        const result = [];
        for(let r = 0; r < 3; r += 1) {
            for(let c = 0; c < 3; c += 1) {
                if(this.get(r, c) === 0) {
                    result.push(new Move(r, c));
                }
            }
        }
        return shuffleArray(result);
    }

    /// Return a new board updated with the move for the current
    /// player.
    makeMove(move) {
        const idx = move.toIdx();
        if(this.data[idx] !== 0) {
            throw 'invalid move';
        }
        const result = this.copy();
        for(let i = 0; i < 9; i += 1) {
            result.data[i] = this.data[i];
        }
        result.data[idx] = this.player;
        result.player = getOpponent(this.player);
        return result;
    }

    /// Draw the board as an html table, for testing.
    toHtml () {
        const out = [];
        out.push('<table><tbody>');
        for(let r = 0; r < 3; r += 1) {
            out.push('<tr>');
            for(let c = 0; c < 3; c += 1) {
                out.push('<td>' +
                         getSymbol(this.data[this.getIdx(r, c)]) +
                         '</td>');
            }
            out.push('</tr>');
        }
        out.push('</tbody></table>');
        return out.join('');
    }

    /// Check if the game is over, and if so, who won.
    isOver() {
        // Check the rows.
        for(let r = 0; r < 3; r += 1) {
            if(this.get(r, 0) !== 0 &&
               this.get(r, 1) === this.get(r, 0) &&
               this.get(r, 1) === this.get(r, 2)) {
                return {over: true,
                        winner: this.get(r, 0)};
            }
        }
        // Check the cols;
        for(let c = 0; c < 3; c += 1) {
            if(this.get(0, c) !== 0 &&
               this.get(0, c) === this.get(1, c) &&
               this.get(0, c) === this.get(2, c)) {
                return {over: true,
                        winner: this.get(0, c)};
            }
        }

        // Check the diagonals.
        if(this.get(1, 1) !== 0) {
            if(this.get(0, 0) === this.get(1, 1) &&
               this.get(0, 0) === this.get(2, 2)) {
                return {over: true,
                        winner: this.get(1, 1)};
            }
            if(this.get(2, 0) === this.get(1, 1) &&
               this.get(2, 0) === this.get(0, 2)) {
                return {over: true,
                        winner: this.get(1, 1)};
            }
        }

        for(let r = 0; r < 9; r += 1) {
            if(this.data[r]  === 0) {
                return {over: false, winner: 0};
            }
        }
        return {over: true, winner: 0};
    }
}

// Manage the game state.
//
// Holds the function to call for each player to make a move, the
// display object, and a callback for when the game is over.
//
// Since JS is asynchronous, this class has two functions to use
// as callbacks.  One is called before a move is made, and the
// other is called after.  This allows the display to update
// between moves too, which is helpful :)
class Game {
    constructor(player1, player2, gameOverCb, display) {
        this.player1 = player1;
        this.player2 = player2;
        this.gameOverCb = gameOverCb;
        this.board = new Board();
        this.display = display;
        this.record = [];
        this.isStarted = false;
        display.draw();
        this.status = document.getElementById('status');
    }
    // Call to update the Display and request the move from the next player.
    play() {
        const boardCopy = this.board.copy();
        // Update the Display.
        if(this.display) {
            this.display.draw(this.board);
        }

        // Ask the player to make a move.
        if(this.board.player === RED) {
            this.status.innerText = "Player 1 to move";
            this.player1.getMove(boardCopy, move => this.doMove(move));
        } else {
            this.status.innerText = "Player 2 to move";
            this.player2.getMove(boardCopy, move => this.doMove(move));
        }
    }

    // Make a move for the player.  There is no checking in here,
    // so someone could easily cheat with this.  But, it would
    // just break their own game.
    doMove(move) {
        try {
            // Make the move, and see if the game is over.
            const newBoard = this.board.makeMove(move),
                  r = newBoard.isOver();

            // Track the current board position, for debugging.
            this.record.push(move);
            this.board = newBoard;

            // Update the board.
            if(this.display) {
                this.display.draw(this.board);
            }

            // Call the game over callback, or ask for the next move.
            if(r.over) {
                this.isStarted = false;
                this.gameOverCb(this);
            } else {
                this.isStarted = true;
                window.setTimeout(() => this.play(), 1);
            }
        } catch (e) {
            console.log('got exception ' + e);
            this.play();
        }
    }
}

// This class controls the user interface.  Connects the display
// to the game, and handles most of the user interaction.  The
// DisplayPlayer can handle user input by mouse clicks on the
// display, but everything else is here.

class GameController {
    constructor() {
        this.display = new Display();
        this.p1 = new UIPlayer(this.display);
        this.p2 = new MiniMax(4);
        this.status = document.getElementById('status');

        const that = this;

        function setupNode(pnum, player, node) {
            node.onclick = () => that.selectPlayer(pnum, player, node);
        }

        // Set up the buttons for picking the players.
        let choices = document.querySelectorAll('#p1 .player');
        Array.from(choices).forEach(x => setupNode(1, x.textContent, x));

        choices = document.querySelectorAll('#p2 .player');
        Array.from(choices).forEach(x => setupNode(2, x.textContent, x));

        // Setup the buttons for starting/stopping the game.
        document.getElementById('start').onclick = () => this.startGame();
        document.getElementById('stop').onclick = () => this.stopGame();
        this.startGame();
    }
    startGame() {
        // this.ui = new UI();
        this.game = new Game(
            this.p1, this.p2, game => {
                this.isStarted = false;
                const r = game.board.isOver();
                if(r.winner === RED) {
                    this.status.innerText = 'Player 1 wins';
                } else if (r.winner === BLUE) {
                    this.status.innerText = 'Player 2 wins';
                } else {
                    this.status.innerText = 'Tie game';
                }
            }, this.display);
        setTimeout(() => this.game.play(), 10);
    }

    // Stop the game (mainly so the user can change the settings.)
    stopGame() {
        this.display.cb = () => {};
        this.status.innerText = 'Shall we play a game?';
        this.game = new Game(this.p1, this.p2, () => {}, this.display);
        this.game.isStarted = false;
    }

    // Pick which code operates a player based on the button.
    selectPlayer(playerNumber, player, node) {
        function build(depth) {
            return new AlphaBeta(depth);
        }
        if(!this.game.isStarted) {
            const root = document.getElementById('p' + playerNumber),
                  choices = root.getElementsByClassName('player');
            // clear the class
            for(let i = 0; i < choices.length; i += 1) {
                let x = choices[i];
                x.className = x.className.replace(
                    /(?:^|\s)selected(?!\S)/g , '');
            }
            node.className += ' selected';

            let newP;
            if(player === 'Human') {
                newP = new UIPlayer(this.display);
            } else if (player === 'Easy') {
                newP = build(2);
            } else if (player === 'Medium') {
                newP = build(4);
            } else if (player === 'Hard') {
                newP = build(6);
            } else if (player === 'Impossible') {
                newP = build(9);
            } else {
                alert('fail');
            }
            if(playerNumber === 1) {
                this.p1 = newP;
            } else {
                this.p2 = newP;
            }

        }
    }
}

// Use a canvas element to display the board.
class Display {
    constructor() {
    this.canvas = null;
    this.ctx = null;
    // this.size = 400;
    this.cb = null;
    this.init();
    }

    init() {
        if(!this.canvas) {
            this.canvas = document.getElementById('tictacboard');
            if(!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.setAttribute('id' , 'tictacboard');
                document.body.appendChild(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            // this.canvas.height = this.size;
            // this.canvas.width = this.size;
        }

        this.draw();
        this.canvas.onclick = event => {
            var bb = this.canvas.getBoundingClientRect(),
                x = event.clientX - bb.left,
                y = event.clientY - bb.top,
                c = Math.floor(3 * x / bb.width),
                r = Math.floor(3 * y / bb.height);
            console.log(event.clientX + ' ' + event.clientY);
            if(this.cb) {
                this.cb(r, c);
                // console.log(x + ' ' + y);
                // console.log(r + ' ' + c);
            }
        };
    }

    draw(board) {
        // Draw the lines.
        const h = this.canvas.height,
              w = this.canvas.width,
              linesY = [h / 3, 2 * h / 3],
              linesX = [w / 3, 2 * w / 3],
              centersY = [h / 6, h / 2, 5 * h / 6],
              centersX = [w / 6, w / 2, 5 * w / 6],
              radius = Math.min(w, h) / 7,
              ctx = this.ctx;

        function drawLine(startx, starty, endx, endy) {
            ctx.beginPath();
            ctx.moveTo(startx, starty);
            ctx.lineTo(endx, endy);
            ctx.stroke();

        }

        this.canvas.height = h;
        this.ctx.save();
        this.ctx.lineWidth = 4;

        drawLine(0, linesY[0], w, linesY[0]);
        drawLine(0, linesY[1], w, linesY[1]);
        drawLine(linesX[0], 0, linesX[0], h);
        drawLine(linesX[1], 0, linesX[1], h);
        this.ctx.restore();

        if(board) {
            for(let r = 0; r < 3; r += 1) {
                for(let c = 0; c < 3; c += 1) {
                    const v = board.get(r, c);
                    if(v !== 0) {
                        this.drawSymbol(v, centersX[c],
                                        centersY[r], radius);
                    }
                }
            }
        }
    }

    drawSymbol(player, x, y, size) {
        this.ctx.save();
        this.ctx.strokeStyle = colorMap.get(player);
        this.ctx.beginPath();
        this.ctx.lineWidth = 20;
        size = size * 0.8;

        if(player === RED) {
            // Draw an X
            this.ctx.moveTo(x - size, y - size);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(x + size, y - size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.stroke();
        } else {
            // Draw an O
            this.ctx.arc(x, y, size, 0, TWOPI);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
}

// Allow a 'human' player to interact with the game.
class Human {
    constructor(name) {
        this.cb = null;
        this.board = null;
        this.name = name;
    }
    getMove(board, cb) {
        console.log('move requested from player: ' + this.name);
        this.board = board;
        this.cb = cb;
    }
}

module_objects.Human = Human;

// Allow a 'human' player to interact with the game.
class UIPlayer {
    constructor(display) {
        this.display = display;
        this.board = null;
        this.name = name;
    }

    getMove (board, cb) {
        console.log('move requested from player: ' + this.name);
        this.display.cb = (r, c) => {
            console.log('got move ' + r + ' ' + c);
            cb(new Move(r, c));
            this.display.cb = null;
        };
    }
}

// A player that just picks random moves.
class Random {
    getMove(board, cb) {
        const moves = board.getMoves(),
              N = moves.length,
              result = moves[Math.floor(Math.random() * N)];
        setTimeout(function() { cb(result); }, 100);
    }
}

module_objects.Random = Random;

// A basic score function that just indicates if the player won or
// lost.
function scoreFunction(board) {
    const r = board.isOver();
    if(r.over) {
        if(r.winner === board.player) {
            return 999;
        } else if (r.winner === getOpponent(board.player)) {
            return -999;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

// A MiniMax implementation for the tictactoe game.
//
// https://en.wikipedia.org/wiki/Minimax#Minimax_algorithm_with_alternate_moves

class MiniMax {
    constructor(depth, scoreFcn) {
        this.scoreFcn = scoreFcn || scoreFunction;
        this.depth = depth;
    }
    search(board, depth) {
        this.count += 1;
        const curResult = board.isOver();
        if(curResult.over || depth === 0 ) {
            return {score: (1+depth) * this.scoreFcn(board), move: null};
        } else {
            const moves = board.getMoves();
            let bestScore = -Infinity, bestMove;
            for(let i = 0; i < moves.length; i += 1) {
                const t = this.search(board.makeMove(moves[i]), depth - 1);
                const score = - t.score;
                if(score > bestScore) {
                    bestScore = score;
                    bestMove = moves[i];
                }
            }
            return {score:bestScore, move:bestMove};
        }
    }
    getMove(board, cb) {
        this.count = 0;
        const  move = this.search(board, this.depth);
        console.log('searched ' + this.count + ' times');
        setTimeout(() => cb(move.move), 100);
    }
}

// An AlphaBeta implementation for the tictactoe game.
//
// This algorithm can greatly reduce the size of the search tree
// for a game, while still giving the exact same result as
// MiniMax.
//
// https://en.wikipedia.org/wiki/Alpha-beta_pruning

class AlphaBeta {
    constructor(depth, scoreFcn) {
        this.scoreFcn = scoreFcn || scoreFunction;
        this.depth = depth;
    }
    // Do the initial call to the search function.
    findMove(board) {
        this.count = 0;
        const move = this.search(board, this.depth, -Infinity, Infinity);
        console.log('move score: ' + move.score);
        console.log('searched ' + this.count + ' times');
        return move;
    }

    search(board, depth, achievable, cutoff) {
        // At every stage, achievable is the best score that the
        // current player can definitely get.  We want to improve that.
        //
        // Cutoff is the best score the opponent can definitely
        // get.  If we find a score greater than this, then the
        // opponent will not select this branch of the tree, so we
        // might as well stop searching it.
        //

        this.count += 1;
        const curResult = board.isOver();
        let bestMove;

        if(curResult.over || depth === 0 ) {
            return {score: this.scoreFcn(board), move: null};
        } else {
            let moves = board.getMoves();
            for(let i = 0; i < moves.length; i += 1) {
                let t = this.search(board.makeMove(moves[i]), depth - 1,
                                    -cutoff, -achievable);
                const score = - t.score;
                if(score > achievable) {
                    achievable = score;
                    bestMove = moves[i];
                    if(achievable >= cutoff) {
                        // This is the magic.  If we return any
                        // value greater or equal to cutoff, the
                        // opponent will take their better choice
                        // instead of this one. So, there is no
                        // sense in looking for an even better move.
                        break;
                    }
                }
            }
            return {score:achievable, move:bestMove};
        }
    }
    // Find the move, and pass it to the call back.
    getMove(board, cb) {
        const move = this.findMove(board);
        setTimeout(() => cb(move.move), 200);
    }
}

function run() {
    module_objects.game = new GameController();
}

export {run};
