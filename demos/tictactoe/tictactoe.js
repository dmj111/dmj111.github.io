/* jshint strict: true, unused:true, undef:true, browser:true */
/* global exports, console, document, alert  */

// This code includes the infrastructure to play a game of
// tic-tac-toe, along with a few "players".
//
// The structure of the player borrows heavily from Peter Norvig's
// Othello code in the "Principles of Artificial Intelligence
// Programming".  http://norvig.com/paip/othello.lisp
//
// A lot of this was a learning project, so take the code with a grain
// of salt.


(function(exports) {
    'use strict';


    var tictactoe = {},  // The module object
        RED = 1,
        BLUE = 2,
        TWOPI = 2 * Math.PI;

    // Make these variable visible on the main object, but as copies
    // of the private values.
    tictactoe.RED = RED;
    tictactoe.BLUE = BLUE;

    // Colors for the players.
    var colorMap = {};
    // Current colors from color brewer http://colorbrewer2.org/
    colorMap[RED] = '#e41a1c';
    colorMap[BLUE] = '#377eb8';

    /// Randomly shuffle the elements of an array.
    function shuffleArray(array) {
        // Use Knuth's Algorithm P to shuffle the array.
        var N = array.length,
            i, j, t;

        for(i = N - 1; i > -1; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            t = array[j];
            array[j] = array[i];
            array[i] = t;
        }
        return array;
    }

    /// Return the opponent of the given player.
    function getOpponent(player) {
        if(player === RED) {
            return BLUE;
        } else if (player === BLUE) {
            return RED;
        } else {
            throw 'impossible';
        }
    }

    /// Get the symbol for a player for the text based board.
    function getSymbol(player) {
        if(player === RED) {
            return 'X';
        } else if (player === BLUE) {
            return 'O';
        } else {
            return '';
        }
    }

    // Helper data structure to represent moves and handle
    // conversions.
    function Move(row, col) {
        this.row = row;
        this.col = col;
    }

    Move.prototype = {
        // Convert a move to the index in the board array.
        toIdx: function() {
            return this.row * 3 + this.col;
        }
    };

    // Data structure to hold the game state and provide some helper
    // functions.
    function Board() {
        this.data = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.player = RED;
    }

    Board.prototype = {
        copy: function() {
            var result = new Board();
            result.data = this.data.slice();
            result.player = this.player;
            return result;
        },

        toString: function() {
            var result = "",
                r, c,
                lookup = {0: '.', 1: 'X', 2: 'O'};
            for(r = 0; r < 3; r += 1) {
                for(c = 0; c < 3; c += 1) {
                    result += lookup[this.data[r*3 + c]];
                }
                result += "\n";
            }
            return result;
        },

        // Return the value on the board.
        get: function(row, col) {
            var idx = row * 3 + col;
            return this.data[idx];
        },

        // Get all of the open positions on the board.
        getMoves: function() {
            var result = [],
                r, c;
            for(r = 0; r < 3; r += 1) {
                for(c = 0; c < 3; c += 1) {
                    if(this.get(r, c) === 0) {
                        result.push(new Move(r, c));
                    }
                }
            }
            return shuffleArray(result);
        },

        /// Return a new board updated with the move for the current
        /// player.
        makeMove: function(move) {
            var idx = move.toIdx(),
                result, i;
            if(this.data[idx] !== 0) {
                throw 'invalid move';
            }
            result = this.copy();
            for(i = 0; i < 9; i += 1) {
                result.data[i] = this.data[i];
            }
            result.data[idx] = this.player;
            result.player = getOpponent(this.player);
            return result;
        },

        /// Draw the board as an html table, for testing.
        toHtml: function () {
            var out = [], r, c;
            out.push('<table><tbody>');
            for(r = 0; r < 3; r += 1) {
                out.push('<tr>');
                for(c = 0; c < 3; c += 1) {
                    out.push('<td>' +
                             getSymbol(this.data[this.getIdx(r, c)]) +
                             '</td>');
                }
                out.push('</tr>');
            }
            out.push('</tbody></table>');
            return out.join('');
        },

        /// Check if the game is over, and if so, who won.
        isOver: function() {
            var r, c;
            // Check the rows.
            for(r = 0; r < 3; r += 1) {
                if(this.get(r, 0) !== 0 &&
                   this.get(r, 1) === this.get(r, 0) &&
                   this.get(r, 1) === this.get(r, 2)) {
                    return {over: true,
                            winner: this.get(r, 0)};
                }
            }
            // Check the cols;
            for(c = 0; c < 3; c += 1) {
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

            for(r = 0; r < 9; r += 1) {
                if(this.data[r]  === 0) {
                    return {over: false, winner: 0};
                }
            }
            return {over: true, winner: 0};
        }

    };

    // Manage the game state.
    //
    // Holds the function to call for each player to make a move, the
    // display object, and a callback for when the game is over.
    //
    // Since JS is asynchronous, this class has two functions to use
    // as callbacks.  One is called before a move is made, and the
    // other is called after.  This allows the display to update
    // between moves too, which is helpful :)
    function Game(player1, player2, gameOverCb, display) {
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

    Game.prototype = {
        // Call to update the Display and request the move from the next player.
        play: function() {
            var boardCopy = this.board.copy(),
                that = this;
            // Update the Display.
            if(this.display) {
                this.display.draw(this.board);
            }

            // Ask the player to make a move.
            if(this.board.player === RED) {
                this.status.innerText = "Player 1 to move";
                this.player1.getMove(boardCopy, function(move) {
                    that.doMove(move);
                });
            } else {
                this.status.innerText = "Player 2 to move";
                this.player2.getMove(boardCopy, function(move) {
                    that.doMove(move);
                });
            }
        },

        // Make a move for the player.  There is no checking in here,
        // so someone could easily cheat with this.  But, it would
        // just break their own game.
        doMove: function(move) {
            try {
                // Make the move, and see if the game is over.
                var newBoard = this.board.makeMove(move),
                    r = newBoard.isOver(),
                    that = this;

                // Track the current board position, for debugging.
                this.record.push(move);
                this.board = newBoard;

                // Update the board.
                if(this.display) {
                    this.display.draw(this.board);
                }

                // Call the game over callback, or ask for the next move.
                if(r.over) {
                    that.isStarted = false;
                    this.gameOverCb(this);
                } else {
                    that.isStarted = true;
                    window.setTimeout(function() { that.play(); },
                                      1);
                }
            } catch (e) {
                console.log('got exception ' + e);
                that.play();
            }
        }

    };

    // This class controls the user interface.  Connects the display
    // to the game, and handles most of the user interaction.  The
    // DisplayPlayer can handle user input by mouse clicks on the
    // display, but everything else is here.

    function GameController() {
        var that = this,
            node, choices, i;

        this.display = new Display();
        this.p1 = new UIPlayer(this.display);
        this.p2 = new MiniMax(4);

        // Set up the buttons for picking the players.
        node = document.getElementById('p1');
        choices = node.getElementsByClassName('player');
        this.status = document.getElementById('status');

        function setupNode(pnum, player, node) {
            node.onclick = function(/*event*/) {
                that.selectPlayer(pnum, player, node);
            };
        }

        for(i = 0; i < choices.length; i += 1) {
            setupNode(1, choices[i].textContent,
                      choices[i]);
        }

        node = document.getElementById('p2');
        choices = node.getElementsByClassName('player');

        for(i = 0; i < choices.length; i += 1) {
            setupNode(2, choices[i].textContent,
                      choices[i]);
        }

        // Setup the buttons for starting/stopping the game.
        document.getElementById('start').onclick = function() {
            that.startGame();
        };
        document.getElementById('stop').onclick = function() {
            that.stopGame();
        };

        this.startGame();
    }

    // Start a new game using the current player selections.
    GameController.prototype.startGame = function () {
        // this.ui = new UI();
        var that = this;
        this.game = new Game(
            this.p1, this.p2, function(game) {
                that.isStarted = false;
                var r = game.board.isOver();
                if(r.winner === RED) {
                    that.status.innerText = 'Player 1 wins';
                } else if (r.winner === BLUE) {
                    that.status.innerText = 'Player 2 wins';
                } else {
                    that.status.innerText = 'Tie game';
                }
            }, this.display);
        setTimeout(function() {
            that.game.play();
        }, 10);
    };

    // Stop the game (mainly so the user can change the settings.)
    GameController.prototype.stopGame = function () {
        this.status.innerText = 'Shall we play a game?';
        this.game = new Game(this.p1, this.p2, function(){}, this.display);
        this.game.isStarted = false;
    };

    // Pick which code operates a player based on the button.
    GameController.prototype.selectPlayer = function(playerNumber, player,
                                                     node) {
        function build(depth) {
            return new AlphaBeta(depth);
        }
        if(!this.game.isStarted) {
            var root = document.getElementById('p' + playerNumber),
                choices = root.getElementsByClassName('player'),
                i, x, newP;
            // clear the class
            for(i = 0; i < choices.length; i += 1) {
                x = choices[i];
                x.className = x.className.replace(
                        /(?:^|\s)selected(?!\S)/g , '');

            }
            node.className += ' selected';

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
    };

    tictactoe.GameController = GameController;

    // Use a canvas element to display the board.
    function Display() {
        this.canvas = null;
        this.ctx = null;
        this.size = 400;
        this.cb = null;
        this.init();
    }

    tictactoe.Display = Display;

    Display.prototype = {
        init: function() {
            if(!this.canvas) {
                this.canvas = document.getElementById('tictacboard');
                if(!this.canvas) {
                    this.canvas = document.createElement('canvas');
                    this.canvas.setAttribute('id' , 'tictacboard');
                    document.body.appendChild(this.canvas);
                }
                this.ctx = this.canvas.getContext('2d');
                this.canvas.height = this.size;
                this.canvas.width = this.size;
            }

            this.draw();
            var that = this;


            this.canvas.onclick = function(event) {

                var bb = that.canvas.getBoundingClientRect(),
                    x = event.clientX - bb.left,
                    y = event.clientY - bb.top,
                    c = Math.floor(3 * x / bb.width),
                    r = Math.floor(3 * y / bb.height);
                console.log(event.clientX + ' ' + event.clientY);
                if(that.cb) {
                    that.cb(r, c);
                    // console.log(x + ' ' + y);
                    // console.log(r + ' ' + c);
                }
            };
        },

        draw: function(board) {
            // Draw the lines.
            var h = this.canvas.height,
                w = this.canvas.width,
                linesY = [h / 3, 2 * h / 3],
                linesX = [w / 3, 2 * w / 3],
                centersY = [h / 6, h / 2, 5 * h / 6],
                centersX = [w / 6, w / 2, 5 * w / 6],
                radius = Math.min(w, h) / 7,
                r, c, v,
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
                for(r = 0; r < 3; r += 1) {
                    for(c = 0; c < 3; c += 1) {
                        v = board.get(r, c);
                        if(v !== 0) {
                            this.drawSymbol(v, centersX[c],
                                            centersY[r], radius);
                        }
                    }
                }
            }
        },

        drawSymbol: function(player, x, y, size) {
            this.ctx.save();
            this.ctx.strokeStyle = colorMap[player];
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
    };


    // Allow a 'human' player to interact with the game.
    function Human(name) {
        this.cb = null;
        this.board = null;
        this.name = name;
    }
    Human.prototype.getMove = function (board, cb) {
        console.log('move requested from player: ' + this.name);
        this.board = board;
        this.cb = cb;
    };

    // Allow a 'human' player to interact with the game.
    function UIPlayer(display) {
        this.display = display;
        this.board = null;
        this.name = name;
    }

    UIPlayer.prototype.getMove = function (board, cb) {
        console.log('move requested from player: ' + this.name);
        var that = this;
        this.display.cb = function(r, c) {
            console.log('got move ' + r + ' ' + c);
            cb(new Move(r, c));
            that.display.cb = null;
        };
    };

    // Setup the exports from the module.
    tictactoe.Human = Human;
    tictactoe.UIPlayer = UIPlayer;
    tictactoe.Move = Move;
    tictactoe.Game = Game;
    tictactoe.Board = Board;
    exports.tictactoe = tictactoe;


    // A player that just picks random moves.
    function Random() {
    }
    Random.prototype.getMove = function(board, cb) {
        var moves = board.getMoves(),
            N = moves.length,
            i,
            result;
        for(i = 0; i < N; i += 1) {
            if(Math.random() < 1 / (1 + i)) {
                result = moves[i];
            }
        }
        setTimeout(function() { cb(result); }, 100);
    };
    tictactoe.Random = Random;


    // A basic score function that just indicates if the player won or
    // lost.
    function scoreFunction(board) {
        var r = board.isOver();
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
    tictactoe.scoreFunction = scoreFunction;

    // A MiniMax implementation for the tictactoe game.
    //
    // https://en.wikipedia.org/wiki/Minimax#Minimax_algorithm_with_alternate_moves

    function MiniMax(depth, scoreFcn) {
        this.scoreFcn = scoreFcn || scoreFunction;
        this.depth = depth;
    }

    MiniMax.prototype.search = function(board, depth) {
        this.count += 1;
        var moves, bestMove, bestScore, i, t, score,
            curResult = board.isOver();
        if(curResult.over || depth === 0 ) {
            return {score: (1+depth) * this.scoreFcn(board), move: null};
        } else {
            moves = board.getMoves();
            bestScore = -Infinity;

            for(i = 0; i < moves.length; i += 1) {
                t = this.search(board.makeMove(moves[i]), depth - 1);
                score = - t.score;
                if(score > bestScore) {
                    bestScore = score;
                    bestMove = moves[i];
                }
            }
            return {score:bestScore, move:bestMove};
        }
    };

    MiniMax.prototype.getMove = function(board, cb) {
        this.count = 0;
        var move = this.search(board, this.depth);
        console.log('searched ' + this.count + ' times');
        setTimeout(function() {
            cb(move.move);
        }, 100);
    };

    tictactoe.MiniMax = MiniMax;


    // An AlphaBeta implementation for the tictactoe game.
    //


    function AlphaBeta(depth, scoreFcn) {
        this.scoreFcn = scoreFcn || scoreFunction;
        this.depth = depth;
    }

    AlphaBeta.prototype = {
        search: function(board, depth, achievable, cutoff) {
            this.count += 1;
            var moves, bestMove, bestScore, i, t, score,
                curResult = board.isOver();
            if(curResult.over || depth === 0 ) {
                return {score: this.scoreFcn(board), move: null};
            } else {
                moves = board.getMoves();
                // achievable = -Infinity;
                // cutoff = Infinity;

                for(i = 0; i < moves.length; i += 1) {
                    t = this.search(board.makeMove(moves[i]), depth - 1,
                                   -cutoff, -achievable);
                    score = - t.score;
                    if(score > achievable) {
                        achievable = score;
                        bestMove = moves[i];
                        if(achievable >= cutoff) {
                            break;
                            // console.log('cutting off');


                        }
                    }
                }
                return {score:achievable, move:bestMove};
            }
        },

        getMove: function(board, cb) {
            var move =this.findMove(board);
            setTimeout(function() {
                cb(move.move);
            }, 100);
        },
        findMove: function(board) {
            this.count = 0;
            var move = this.search(board, this.depth, -Infinity, Infinity);
            console.log('move score: ' + move.score);
            console.log('searched ' + this.count + ' times');
            return move;
        }


    };

    tictactoe.AlphaBeta = AlphaBeta;


    tictactoe.run = function() {
        tictactoe.game = new tictactoe.GameController();
    };
} (typeof exports !== 'undefined' && exports || this));
