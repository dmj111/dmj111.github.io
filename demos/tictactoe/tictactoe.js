/* jshint strict: true, unused:true, undef:true, browser:true */
/* global exports, console, document, alert  */


(function(exports) {
    'use strict';

    var tictactoe = {},
        RED = 1,
        BLUE = 2,
        TWOPI = 2 * Math.PI;

    tictactoe.RED = RED;
    tictactoe.BLUE = BLUE;

    var colorMap = {};
    colorMap[RED] = 'red';
    colorMap[BLUE] = 'blue';

    /* Randomly shuffle the elements of an array */
    function shuffleArray(array) {
        var N = array.length,
            i, j, t;

        for(i = 0; i < N; i += 1) {
            j = Math.floor(Math.random() * (i + 1));
            t = array[j];
            array[j] = array[i];
            array[i] = t;
        }
        return array;
    }

    /* Find the opponent of a player */
    function getOpponent(player) {
        if(player === RED) {
            return BLUE;
        } else if (player === BLUE) {
            return RED;
        } else {
            throw 'impossible';
        }
    }

    /* Get the symbol for a player */
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
        toIdx: function() {
            return this.row * 3 + this.col;
        }
    };

    var board = {
        create: function() {
            var obj = Object.create(board);
            obj.data = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            obj.player = RED;
            return obj;
        },
        copy: function() {
            var obj = board.create();
            var i;
            for(i = 0; i < 9; i += 1) {
                obj.data[i] = this.data[i];
            }
            obj.player =this.player;
            return obj;

        },

        get: function(row, col) {
            var idx = row * 3 + col;
            return this.data[idx];
        },

        getMoves: function() {
            var result = [],
                r, c;
            for(r = 0; r < 3; r += 1) {
                for(c = 0; c < 3; c += 1) {
                    if(this.data[r*3 + c] === 0) {
                        result.push(new Move(r, c));
                    }
                }
            }
            return shuffleArray(result);
        },

        makeMove: function(move) {
            var idx = move.toIdx(),
                result, i;
            if(this.data[idx] !== 0) {
                throw 'invalid move';
            }
            result = board.create();
            for(i = 0; i < 9; i += 1) {
                result.data[i] = this.data[i];
            }
            result.data[idx] = this.player;
            result.player = getOpponent(this.player);
            return result;
        },

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

        isOver: function() {
            var r, c;
            for(r = 0; r < 3; r += 1) {
                if(this.get(r, 0) !== 0 &&
                   this.get(r, 1) === this.get(r, 0) &&
                   this.get(r, 1) === this.get(r, 2)) {
                    return {over: true,
                            winner: this.get(r, 0)};
                }
            }
            for(c = 0; c < 3; c += 1) {
                if(this.get(0, c) !== 0 &&
                   this.get(0, c) === this.get(1, c) &&
                   this.get(0, c) === this.get(2, c)) {
                    return {over: true,
                            winner: this.get(0, c)};
                }
            }
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

    function Game(player1, player2, cb, ui) {
        this.player1 = player1;
        this.player2 = player2;
        this.cb = cb;
        this.board = board.create();
        this.ui = ui;
        this.record = [];
        this.isStarted = false;
        ui.draw();
        this.status = document.getElementById('status');
    }

    Game.prototype = {
        play: function() {
            var boardCopy = this.board.copy(),
                that = this;
            if(this.ui) {
                this.ui.draw(this.board);

            }
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

        doMove: function(move) {
            try {
                var newBoard = this.board.makeMove(move),
                    r = newBoard.isOver(),
                    that = this;
                this.record.push(move);
                this.board = newBoard;

                if(this.ui) {
                    this.ui.draw(this.board);
                }

                if(r.over) {
                    that.isStarted = false;
                    this.cb(this);
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

    function GameController() {
        var that = this,
            node, choices, i;

        this.ui = new UI();
        this.p1 = new UIPlayer(this.ui);
        this.p2 = new MiniMax(4);

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

        document.getElementById('start').onclick = function() {
            that.startGame();
        };
        document.getElementById('stop').onclick = function() {
            that.stopGame();
        };

        this.startGame();


    }

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
                // reset?
            }, this.ui);
        setTimeout(function() {
            that.game.play();
        }, 10);
    };

    GameController.prototype.stopGame = function () {
        this.status.innerText = 'Shall we play a game?';
        this.game = new Game(this.p1, this.p2, function(){}, this.ui);
        this.game.isStarted = false;
    };


    GameController.prototype.selectPlayer = function(playerNumber, player,
                                                     node) {
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
                newP = new UIPlayer(this.ui);
            } else if (player === 'Easy') {
                newP = new MiniMax(2);
            } else if (player === 'Medium') {
                newP = new MiniMax(4);
            } else if (player === 'Hard') {
                newP = new MiniMax(6);
            } else if (player === 'Impossible') {
                newP = new MiniMax(9);
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

    function UI() {
        this.canvas = null;
        this.ctx = null;
        this.size = 400;
        this.cb = null;
        this.init();
    }

    tictactoe.UI = UI;

    UI.prototype = {
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
                r, c, v;
            this.canvas.height = h;
            this.ctx.save();
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(0, linesY[0]);
            this.ctx.lineTo(w, linesY[0]);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, linesY[1]);
            this.ctx.lineTo(w, linesY[1]);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(linesX[0], 0);
            this.ctx.lineTo(linesX[0], h);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(linesX[1], 0);
            this.ctx.lineTo(linesX[1], h);
            this.ctx.stroke();
            this.ctx.restore();
            if(board) {
                for(r = 0; r < 3; r += 1) {
                    for(c = 0; c < 3; c += 1) {
                        v = board.get(r, c);
                        if(v !== 0) {
                            this.ctx.save();
                            this.ctx.fillStyle = colorMap[v];
                            this.ctx.beginPath();
                            this.ctx.arc(centersX[c], centersY[r], radius, 0, TWOPI);
                            this.ctx.fill();
                            this.ctx.restore();
                        }
                    }
                }
            }

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
    function UIPlayer(ui) {
        this.ui = ui;
        this.board = null;
        this.name = name;
    }

    UIPlayer.prototype.getMove = function (board, cb) {
        console.log('move requested from player: ' + this.name);
        var that = this;
        this.ui.cb = function(r, c) {
            console.log('got move ' + r + ' ' + c);
            cb(new Move(r, c));
            that.ui.cb = null;
        };
    };

    tictactoe.Human = Human;
    tictactoe.UIPlayer = UIPlayer;
    tictactoe.Move = Move;
    tictactoe.Game = Game;
    tictactoe.board = board;
    exports.tictactoe = tictactoe;

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


    // Return high if the next player lost, low if current player won.
    function scoreFunction(board) {
        var r = board.isOver();
        if(r.over) {
            if(r.winner === board.player) {
                return 999;
            } else if (r.winner === getOpponent(board.player)) {
                return -999;
            } else {
                return 1;
            }
        } else {
            return 0;
        }
    }
    tictactoe.scoreFunction = scoreFunction;

    function MiniMax(depth, scoreFcn) {

        this.scoreFcn = scoreFcn || scoreFunction;
        this.depth = depth;
    }

    MiniMax.prototype.search = function(board, depth) {
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
        var move = this.search(board, this.depth);
        setTimeout(function() {
            cb(move.move);
        }, 100);
    };

    tictactoe.MiniMax = MiniMax;

    tictactoe.run = function() {
        tictactoe.game = new tictactoe.GameController();
    };

} (typeof exports !== 'undefined' && exports || this));
