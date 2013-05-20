/* board.js */
/* globals module */

var reversi = (function(my) {
    'use strict';

    var BLACK = 1,
        WHITE = 2,
        EMPTY = 0,
        allDirections = [-11, -10, -9, -1, 1, 9, 10, 11];

    my.allDirections = allDirections;
    my.BLACK = BLACK;
    my.WHITE = WHITE;
    my.EMPTY = EMPTY;

    /* Simple test for verifying that MOVE is a valid move number */
    function isValid(move) {
        return (move > 10 && move < 89 &&
                move % 10 > 0 && move % 10 < 9);
    }

    /* Returns the opponent for PLAYER */
    function opponent(player) {
        if(player === WHITE) {
            return BLACK;
        } else if (player  === BLACK) {
            return WHITE;
        } else {
            throw 'invalid player in opp';
        }
    }

    my.opponent = opponent;


    /* Board constructor. Tracks move number, player, and data. */
    function Board (data, move, player) {
        var i;
        this.moveNumber = move || 0;
        this.player = player || BLACK;
        this.data = data;
        if (!data) {
            this.data = [];
            for(i = 0; i < 100; i += 1) {
                this.data[i] = EMPTY;
            }
        }
    }


    my.Board = Board;

    my.boardFromString = function(s) {
        var b = new Board();
        b.fromString(s);
        return b;
    };

    my.boardFromJSON = function(json) {
        var obj = JSON.parse(json);
        return new Board(obj.data.slice(),
                         obj.moveNumber, obj.player);

    };

    Board.prototype = {
        /* Create a copy of the current board. */
        copy: function() {
            // return my.boardFromJSON(this.toJSON());
            return new Board(this.data.slice(), this.moveNumber, this.player);
        },

        pieces: function() {
            return this.data.map(x =>  {
                if (x === this.player) {
                    return 1;
                } else if (x === EMPTY) {
                    return 0;
                } else {
                    return 2;
                }
            });
        },

        toJSON: function () {
            var data = {data: this.data,
                        moveNumber: this.moveNumber,
                        player: this.player};
            return JSON.stringify(data);
        },

        /* Make a nice string out of the board. */
        toString: function() {
            var result = [], i, j, p, row;
            for(i = 1; i < 9; i += 1) {
                row = [];
                for(j = 1; j < 9; j += 1) {
                    p = this.data[i * 10 + j];
                    if(p === BLACK) {
                        row.push('@');
                    } else if(p === WHITE) {
                        row.push('O');
                    } else {
                        row.push('.');
                    }
                }
                result.push(row.join(''));
            }
            return result.join('\n');
        },

        fromString: function(input) {
            var row, col,
                lines = input.split('\n'),
                p, x;

            this.moveNumber = 60;
            for(row = 1; row < 9; row += 1) {
                for(col = 1; col < 9; col += 1) {
                    p = lines[row-1][col-1];
                    x = EMPTY;
                    if (p === '@') {
                        x = BLACK;
                    } else if (p === 'O') {
                        x = WHITE;
                    } else {
                        --this.moveNumber;
                    }
                    this.set(row * 10 + col, x);
                }
            }
            if(lines.length > 8) {
                if(lines[8][0] == 'b') {
                    this.player = BLACK;
                } else {
                    this.player = WHITE;
                }
            }
        },

        /* Convert to a 64 bit packed representation */
        toPacked: function() {
            // bit 0: row 0, col 0
            // bit 1: row 0, col 1
            // stores: BLow, BHigh, WLow, WHigh
            var result = [0, 0],
                mult = 1,
                row, col,
                x;
            for(row = 1; row < 9; row += 1) {
                for(col = 1; col < 9; col += 1) {
                }
            }

        },
        // 128 chars to represent as a bitboard
        // 32 chars to represent as hex
        // 16 chars to pack into 8bit chars
        // 4 64-bit numbers
        // in 8 16-bit chars!

        // toHex: function() {
        //     var that = this;
        //     function getPlayerCode(p) {
        //         var codes = [],
        //             code,
        //             r, c;
        //         for(r = 1; r < 9; r += 2) {
        //             code = 0;
        //             for(c = 1; c < 9; c += 1) {
        //                 code = code * 2;
        //                 if(that.data[r * 10 + c] === p) {
        //                     code += 1;
        //                 }
        //             }
        //             codes.push(code);
        //         }
        //         return String.fromCharCode.apply(String, codes);
        //     }
        //     return getPlayerCode(1) + getPlayerCode(2);
        // },

        // fromHex: function(hex) {
        //     var board = new Board();
        // },


        get: function(square) {
            return this.data[square];
        },

        set: function(square, v) {
            this.data[square] = v;
        },

        /* returns a list of all of the valid squares */
        allSquares: (function() {
            var i, result = [];
            for(i = 11; i < 89; i += 1) {
                if(i % 10 > 0 && i % 10 < 9) {
                    result.push(i);
                }
            }

            return result;
        }()),


        /* Check the move for the player, then return a copy of the
           board with the updated state   */
        makeMove: function(move, player) {
            if(player !== this.player) {
                throw 'invalid player in make move';
            }
            if(!this.isLegal(move, player)) {
                throw 'invalid move';
            }
            var result = this.copy();
            result.moveNumber += 1;
            allDirections.forEach(function(dir) {
                result.makeFlips(move, player, dir);
            });
            result.player = result.nextToPlay(result.player);
            return result;
            // result.player = result.nextToPlay(result.player);
        },

        /* Make all flips in the given direction. */
        makeFlips: function(move, player, dir) {
            var end = this.findBracketingPiece(move, player, dir);
            if(end !== 0) {
                for(; move !== end; move += dir) {
                    this.set(move, player);
                }
            }
        },

        /* Moving DIR from SQUARE, return the piece owned by PLAYER
        // that occurs after a string of opponent pieces.
        //
        // Returns 0 if no such square is found.
        */
        findBracketingPiece: function(move, player, dir) {
            var s = move + dir,
                opp = opponent(player),
                p;
            if(this.get(s) === opp) {
                while(true) {
                    s += dir;
                    p = this.get(s);
                    if(p === EMPTY) {
                        return 0;
                    } else if (p === player) {
                        return s;
                    } else if (p === opp) {
                    } else {
                        throw 'should never happen';
                    }
                }
            } else {
                return 0;
            }
        },

        // check if a move would flip in the given direction.
        wouldFlip: function(move, player, dir) {
            return this.findBracketingPiece(move, player, dir) !== 0;
        },


        isLegal: function(move, player) {
            var that = this;
            if(isValid(move) && this.get(move) === EMPTY) {
                return allDirections.some(function(dir) {
                    return that.wouldFlip(move, player, dir);
                });
            }
            return false;
        },

        legalMoves: function(player) {
            var that = this;
            return this.allSquares.filter(function(move) {
                return that.isLegal(move, player);
            });

        },

        anyLegalMove: function(player) {
            var that = this;
            return this.allSquares.some(function(move) {
                return that.isLegal(move, player);
            });

        },

        /* Given the current state of the board, which player has the next move. */
        nextToPlay: function(previousPlayer) {
            var opp = opponent(previousPlayer);
            if(this.anyLegalMove(opp)) {
                return opp;
            } else if(this.anyLegalMove(previousPlayer)) {
                return previousPlayer;
            } else {
                return null;
            }
        },

        countDifference: function(player) {
            var opp = opponent(player),
                that = this;
            return this.allSquares.reduce(function(count, move) {
                var p = that.get(move);
                if(p === player) {
                    return count + 1;
                } else if (p === opp) {
                    return count - 1;
                } else {
                    return count;
                }
            }, 0);
        },

        /* test if the game is over, and if so, return the score. */
        isOver: function(player) {
            player = player || BLACK;
            var p = this.nextToPlay(player) === null,
                s;
            if(p) {
                s = this.countDifference(player);
                s = s * 101;
                return {over: true,
                        score: s};
            } else {
                return {over: false};
            }
        },

        /* Return a new board, flipped across the rows (i.e., a square
         * stays in the same row) */
        flipBoard: function() {
            var result = this.copy(), r, c;
            for(r = 0; r < 10; r += 1) {
                for(c = 0; c < 10; c += 1) {
                    result.data[r * 10 + c] = this.data[r * 10 + 9 - c];
                }
            }
            return result;
        }
    };

    my.getInitialBoard = function() {
        var result = new Board();
        result.set(44, WHITE);
        result.set(45, BLACK);
        result.set(54, BLACK);
        result.set(55, WHITE);
        return result;
    };

    return my;
} (reversi || {}));
/* display.js */
/* global console */

var reversi = (function (my) {
    'use strict';
    var WHITE = my.WHITE,
        BLACK = my.BLACK,
        EMPTY = my.EMPTY;

    function Display(canvas, board) {
        var i,
            that = this;
        this.canvas = canvas;
        this.board = board;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.ctx = this.canvas.getContext('2d');
        this.lineXs = [];
        this.lineYs = [];
        this.cb = null;

        for(i = 0; i < 9; i += 1) {
            this.lineXs.push(Math.floor(i * this.width / 8));
        }

        for(i = 0; i < 9; i += 1) {
            this.lineYs.push(Math.floor(i * this.height / 8));
        }

        this.centerXs = [];
        this.centerYs = [];
        for(i = 0; i < 8; i += 1) {
            this.centerXs.push(Math.floor(this.width * (i / 8 + 1 / 16)));
        }

        for(i = 0; i < 8; i += 1) {
            this.centerYs.push(Math.floor(this.height * (i / 8 + 1 / 16)));
        }
        this.pieceRadius = Math.min(this.width, this.height) / 19;
        this.moveRadius = this.pieceRadius / 2;

        this.lineXs[0] += 1;
        this.lineXs[8] -= 1;
        this.lineYs[0] += 1;
        this.lineYs[8] -= 1;
        this.draw();

        this.canvas.onclick = function(event) {
            var bb = that.canvas.getBoundingClientRect(),
                x = event.clientX - bb.left,
                y = event.clientY - bb.top,
                c = 1 + Math.floor(8 * x / bb.width),
                r = 1 + Math.floor(8 * y / bb.height);
            // console.log(event.clientX + ' ' + event.clientY);
            // console.log('loc ' + r + ' ' + c);
            if(that.cb) {
                that.cb(r, c);
                // console.log(x + ' ' + y);

            }
        };
    }

    Display.prototype = {

        draw: function(cb) {
            var colors = {};
            var shaded = {};
            colors[WHITE] = '#f8f8f8';
            colors[BLACK] = '#040404';
            shaded[WHITE] = '#f8f8f888';
            shaded[BLACK] = '#04040488';

            var background = '#808080';
            var line_color = '#e0e0e0';
            var i, j, p, fill;
            var player = this.board.player;
            var legalMoves, moves = {};

            if(player) {
                legalMoves = this.board.legalMoves(player);
                for(i = 0; i < legalMoves.length; i += 1) {
                    moves[legalMoves[i]] = true;
                }
            }

            this.ctx.save();
            this.ctx.fillStyle = background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // For the lines
            this.ctx.strokeStyle = line_color;
            for(i = 0; i < this.lineXs.length; i += 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.lineXs[i], 0);
                this.ctx.lineTo(this.lineXs[i], this.height);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            for(i = 0; i < this.lineYs.length; i += 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.lineYs[i]);
                this.ctx.lineTo(this.height, this.lineYs[i]);
                this.ctx.stroke();
            }

            for(i = 0; i < 8; i += 1) {
                for(j = 0; j < 8; j += 1) {
                    p = this.board.get(11 + i * 10 + j);
                    if(p !== EMPTY) {
                        fill = colors[p];
                        // alert(p);
                        this.ctx.fillStyle = fill;
                        this.ctx.strokeStyle = fill;
                        this.ctx.beginPath();
                        this.ctx.arc(this.centerXs[i], this.centerYs[j],
                                     this.pieceRadius, 0, 6.29);
                        this.ctx.fill();
                        this.ctx.stroke();
                    } else if (moves[11 + i * 10 + j]) {
                        fill = shaded[player];
                        // alert(p);
                        this.ctx.fillStyle = fill;
                        this.ctx.strokeStyle = fill;
                        this.ctx.beginPath();
                        this.ctx.arc(this.centerXs[i], this.centerYs[j],
                                     this.moveRadius, 0, 6.29);
                        this.ctx.fill();
                        this.ctx.stroke();
                    }
                }
            }

            this.ctx.restore();
            if(cb) {
                setTimeout(cb, 50);
            }
        }
    };
    my.Display = Display;
    return my;
}(reversi || {}));
/* game.js */
/* globals define, console, window */

var reversi = (function(my) {
    'use strict';
    var BLACK = my.BLACK,
        WHITE = my.WHITE;

    function Game(player1, player2, display, status,
                  gameOverCb, isCanceled) {
        this.player1 = player1;
        this.player2 = player2;
        this.display = display;
        this.player = BLACK;
        this.board = my.getInitialBoard();
        this.lastTime = new Date();
        this.status = status;
        this.gameOverCb = gameOverCb;
        this.isCanceled = isCanceled;
        this.moves = [];
        this.updateMoves = ((x) => null);

        if(typeof this.status !== 'function') {
            this.status = ((x) => null);
        }
    }

    Game.prototype = {
        play: function() {
            var newBoard = this.board.copy(),
                that = this,
                player;
            this.lastTime = new Date();

            if(this.display) {
                this.display.board = this.board;
                this.display.draw();
            }

            if(this.player === BLACK) {
                player = this.player1;
            } else {
                player = this.player2;
            }

            player.getMove(newBoard, function(move) {
                that.doMove(that.player, move);
            });

        },

        doMove: function(player, move) {
            var that = this,
                newBoard, r,
                delay;
            try {
                if(this.board.isLegal(move, player)) {
                    var x, y;
                    x = move % 10;
                    y = (move - x) / 10;
                    this.moves.push([y * 10 + x, player]);
                    this.updateMoves(this.moves.slice());
                    // console.log('move ' + move);
                    newBoard = this.board.makeMove(move, player);
                    this.board = newBoard;
                    this.display.board = this.board;
                    if(this.display) {
                        this.display.draw();
                    }
                    var i, b = 0, w = 0;
                    for(i = 0; i < 100; i += 1) {
                        if(this.board.data[i] === BLACK) {
                            b += 1;
                        } else if (this.board.data[i] === WHITE) {
                            w += 1;
                        }
                    }
                    this.status('Black: ' + b + '  White: ' + w);

                    r = newBoard.isOver();
                    if(r.over) {
                        if(this.gameOverCb) { this.gameOverCb(newBoard); }
                    } else {
                        this.player = newBoard.nextToPlay(this.player);
                        delay = 50;
                        if (typeof this.isCanceled !== 'undefined' &&
                            this.isCanceled()) {
                            that.status = 'canceled';
                        } else {
                            // Set a delay to make give the UI a
                            // chance to catch events.
                            window.setTimeout(function() {
                                that.play();
                            }, delay);
                        }
                    }
                } else {
                    that.play();
                }
            } catch (e) {
                console.log('got exception ' + e);
                that.play();
            }
        }

    };
    my.Game = Game;
    return my;
}(reversi || {}));
/* globals module */

var reversi = (function(my) {
    'use strict';

    my.shuffleArray = function(array) {
        var N = array.length,
            i, j, t;

        for(i = 0; i < N; i += 1) {
            j = Math.floor(Math.random() * (i + 1));
            // console.log('i: ' + i + ' j: ' + j);
            t = array[j];
            array[j] = array[i];
            array[i] = t;
        }
        return array;
    };
    // Bring the first move from the principal variation to the front of
    // the move list.
    my.reorder = function(moves, pv) {
        var N = moves.length, i, v;
        if(pv && pv.length > 0) {
            v = pv[0];
            for(i = 0; i < N; i += 1) {
                if(moves[i] === v) {
                    moves[i] = moves[0];
                    moves[0] = v;
                    break;
                }
            }
        }
        return moves;
    };
    my.util = {};

    my.util.objectMap = function(obj, fcn) {
        var key, result = {};
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                result[key] = fcn(obj[key], key, obj);
            }
        }
        return result;
    };

    my.util.objectReduce = function(obj, fcn, init) {
        var key;
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                init = fcn(init, obj[key], key, obj);
            }
        }
        return init;
    };

    my.util.objectForEach = function(obj, fcn) {
        var key;
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                fcn(obj[key], key, obj);
            }
        }
    };
    return my;
}(reversi || {}));

/* globals module */

var reversi = (function(my) {
    'use strict';

    my.mobility = function(board, player) {
        return board.legalMoves(player).length -
            board.legalMoves(my.opponent(player)).length;
    };

    my.countDifference = function(board, player ) {
        return board.countDifference(player);
    };

    var weights = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 120, -20, 20, 5, 5, 20, -20, 120, 0,
        0, -20, -40, -5, -5, -5 ,5, -40, -20, 0,
        0, 20, -5, 15, 3, 3, 15, -5, 20, 0,
        0, 5, -5, 3, 3, 3, 3, -5, 5, 0,
        0, 5, -5, 3, 3, 3, 3, -5, 5, 0,
        0, 20, -5, 15, 3, 3, 15, -5, 20, 0,
        0, -20, -40, -5, -5, -5 ,5, -40, -20, 0,
        0, 120, -20, 20, 5, 5, 20, -20, 120, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    function weightedDifference(board, player) {
        var opp = my.opponent(player),
            score = board.allSquares.reduce(function(score, move) {
                var p = board.get(move);
                if(p === player) {
                    return score + weights[move];
                } else if(p === opp) {
                    return score - weights[move];
                } else {
                    return score;
                }
            });
        if(weights.length !== 100) { throw 'bad'; }
        return score;
    }

    my.weightedDifference = weightedDifference;

    my.modifiedWeightedDifference = function(board, player) {
        var w = weightedDifference(board, player),
            corners = [11, 18, 81, 88],
            opp = my.opponent(player);
        return corners.reduce(function(w, square) {
            if(board.get(w) !== my.EMPTY) {
                return my.allDirections.reduce(function(w, dir) {
                    var s = dir + square,
                        p = board.get(s);
                    if(p === player) {
                        return w - (5 - weights[s]);
                    } else if (p === opp) {
                        return w + (5 - weights[s]);
                    } else {
                        return w;
                    }
                }, w);
            } else {
                return w;
            }
        }, w);
    };
    return my;
}(reversi || {}));

/* alphabeta6.js */
/* globals module, console */

var reversi = (function(my) {
    'use strict';
    // var verbose = true;
    function AlphaBeta6(options) {
        this.maxDepth = options.maxDepth || 64;
        // Just to keep it from running forever
        this.maxTime = options.maxTime || 60000;
        this.fcn = options.scoreFunction;
        this.verbose = options.verbose;
    }

    AlphaBeta6.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },
        findMove: function(board) {
            try {
                console.time('findMove');
                var result = this.findMoveInner(board);
                return result;
            } finally {
                console.timeEnd('findMove');
            }
        },
        findMoveInner: function(board) {
            var best, pv, newBest;

            this.count = 0;
            pv = null;
            this.startTime = null;
            best = this.search(board.player, board, -Infinity,
                               Infinity, 1, pv, []);
            pv = best.pv;
            this.startTime = new Date();
            console.log('player ' + board.player +
                        ' best at depth ' + 1 + ' score ' +
                        best.score.toFixed(5) + ' move ' + best.move);
            try  {
                for(var depth = 2; depth <= this.maxDepth; depth += 1) {
                    this.depth = depth;
                    newBest = this.search(board.player, board, -Infinity,
                                          Infinity, depth, pv, []);
                    best = newBest;
                    console.log('player ' + board.player +
                                ' best at depth ' + depth + ' score ' +
                                best.score.toFixed(5) + ' move ' + best.move);
                    pv = best.pv;

                    // TODO: this isn't catch what we think it is catching..

                    if(best.over) {
                        break;
                    }
                }
            } catch (e) {
                if(e.timeout) { console.warn('timed out...'); }
                else {
                    // console.groupEnd('findMove');
                    throw(e);
                }
            }

            if(this.verbose) {
                console.log('did ' + this.count + ' calls to search ' +
                            best.score + ' ' + best.move);
            }
            console.log('%c best move: %d  score: %s  player:%d',
                        'font-weight: bold', best.move, (best.score).toFixed(5),
                        board.player);
            return best;
        },


        search: function(player, board, achievable, cutoff, depth, pv, seq) {
            var moves,
                that = this,
                opp = my.opponent(player),
                s,
                i, newBoard,
                best = {score: -Infinity,
                        move: 'cutoff',
                        player: player},
                newDepth;
            this.count += 1;
            if(depth === 0) {
                s = board.isOver(player);
                if(s.over) {
                    return s;
                } else {
                    s = {score: this.fcn(board, player),
                         move: 'depth reached',
                         player: player,
                         pv: null};
                    return s;
                }
            }

            moves = board.legalMoves(player);

            if(depth === this.depth) {
                // Mix up the order to make the games more unique.
                my.shuffleArray(moves);
            }


            if(moves.length === 0) {
                if(pv && pv.length) { pv = pv.slice(1); }
                if(board.anyLegalMove(my.opponent(player))) {
                    s = this.search(my.opponent(player), board, -cutoff,
                                    -achievable, depth, pv, seq);
                    return {score: -s.score,
                            move: 'no move',
                            child: s,
                            player: player,
                            over: s.over,
                            pv: [null].concat(s.pv)
                           };
                } else {
                    s = board.isOver(player);
                    return s;
                }
            } else {
                // Order the moves by their score in the cache, if there
                // are any.

                // because they represent the opponent score, not the
                // player score.

                // Simple quiessence search.
                if(moves.length === 1) {
                    newDepth = depth;
                }

                my.reorder(moves, pv);

                if(pv && pv.length) {
                    pv = pv.slice(1);
                }

                if(this.startTime && new Date() - this.startTime >
                   this.maxTime) {
                    throw {timeout: true};
                }


                for(i = 0; i < moves.length; i += 1) {
                    newBoard = board.makeMove(moves[i], board.player);


                    newDepth = depth;
                    if(moves.length === 0) { newDepth = depth; }
                    seq.push(moves[i]);
                    s = that.search(opp, newBoard, -cutoff,
                                    -achievable, newDepth - 1, pv, seq);
                    seq.pop();
                    if (seq.length == 0) {
                        console.log('move %s score %s', moves[i], (-s.score).toFixed(5));
                    }
                    pv = [];
                    if(-s.score > best.score) {
                        best = {
                            score: -s.score,
                            move: moves[i],
                            child: s,
                            pv: [moves[i]].concat(s.pv),
                            over: s.over
                        };
                        if (best.score > achievable) {
                            achievable = best.score;
                        }
                    }
                    if(achievable >= cutoff) {
                        break;
                    }
                }
                best.player = player;
                return best;
            }
        }
    };
    my.AlphaBeta6 = AlphaBeta6;
    return my;
}(reversi || {}));
/* randomplayer.js */
/* global module */

var reversi = (function(my) {
    'use strict';
    function RandomPlayer () {
        this.ab = new reversi.AlphaBeta6({
            maxDepth: 8,
            maxTime: 10000,
            scoreFunction: my.countDifference,
            verbose: true});
    }

    RandomPlayer.prototype = {
        getMove: function(board, cb) {
            cb(this.findMove(board).move);
        },
        findMove: function(board) {
            if(board.moveNumber > 52) {
                this.ab.findMove(board);
            }
             var moves = board.legalMoves(board.player);
            my.shuffleArray(moves);
            return {move: moves[0], player: board.player};
        }
    };

    my.RandomPlayer = RandomPlayer;
    return my;
}(reversi || {}));

/* bayescore.js */
/* global module, console */

var reversi = (function(my) {
    'use strict';

    function objectMap(obj, fcn) {
        var key, result = {};
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                result[key] = fcn(obj[key], key, obj);
            }
        }
        return result;
    }

    function objectReduce(obj, fcn, init) {
        var key;
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                init = fcn(init, obj[key], key, obj);
            }
        }
        return init;
    }

    function objectForEach(obj, fcn) {
        var key;
        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                fcn(obj[key], key, obj);
            }
        }
    }

    var module = my.bayesScore = {};

    // Rotate the board 90 degrees clockwise.
    module.rotate = function (square) {
        var r = Math.floor(square / 10),
            c = square % 10,
            nc = 9-r,
            nr = c,
            result = nr*10 + nc;
        return result;
    };


    /// flip the board
    module.flip = function (square) {
        var r = Math.floor(square / 10),
            c = square % 10,
            nc = 9-c,
            result = r*10 + nc;
        return result;
    };

    module.generate_patterns = function(pattern, is_d8) {
        var i, result = [],
            N = is_d8 ? 2 : 4;

        for(i = 0; i < N; i += 1) {
            result.push(pattern);
            pattern = pattern.map(module.rotate);
        }
        return result;
    };

    // Only need the first half of the features for position
    // evaluation.  The second half is used for training too.  We pay
    // the price for the mirrored features at learning time, so the
    // scoring can be faster.
    var features = (function () {
        // Features from logistello papers.

        // These are the base patterns.
        var initial = {
            'd4': {groups: [[14, 23, 32, 41]]},
            'd5': {groups: [[15, 24, 33, 42, 51]]},
            'd6': {groups: [[16, 25, 34, 43, 52, 61]]},
            'd7': {groups: [[17, 26, 35, 44, 53, 62, 71]]},
            'd8': {groups: [[18, 27, 36, 45, 54, 63, 72, 81]]},
            'h2': {groups: [[21, 22, 23, 24, 25, 26, 27, 28]]},
            'h3': {groups: [[31, 32, 33, 34, 35, 36, 37, 38]]},
            'h4': {groups: [[41, 42, 43, 44, 45, 46, 47, 48]]},
            'edgex': {groups: [[11, 22, 12, 13, 14, 15, 16, 17, 27, 18]]},
            'b2x4': {groups: [[11, 12, 13, 14, 21, 22, 23, 24]]},
            'b3x3': {groups: [[11, 12, 13, 21, 22, 23, 31, 32, 33]]}
        },
            i,
            key, groups;

        // Build up all of the patterns from the base pattern
        // (rotating and flipping the board.)

        objectForEach(initial, function(value, key, initial) {
            groups = value.groups[0];
            value.size = groups.length;
            for(i = 0; i < 3; i += 1) {
                groups = groups.map(module.rotate);
                value.groups.push(groups);
            }
            value.v = 1;

            // Do the flips at the end, so they are all together
            // in the table.  d8 has only two instances though,
            // not 8, so we don't want to flip it again.

            if(key !== 'd8') {
                for(i = 0; i < 4; i += 1) {
                    groups = value.groups[i].map(module.flip);
                    value.groups.push(groups);
                }
            } else {
                value.v = 2;
            }
        });
        return initial;
    }());

    module.features = features;
    // Find the features for the current board.
    module.evaluateFeatures = function (board) {
        var result = {},
            key,
            tmp, i, N;

        tmp = {};
        for(key in features) {
            if(features.hasOwnProperty(key)) {
                // console.log('key: ' + key);
                if(key === 'b2x4') {
                    tmp[key] = features[key].groups.map(evalFeature);
                } else {
                    // Only use the first half.  The second half are
                    // mirrors.
                    N = features[key].groups.length / 2;
                    tmp[key] = [];
                    for(i = 0; i < N; i += 1) {
                        tmp[key].push(evalFeature(
                            features[key].groups[i]
                        ));
                    }
                }

            }
        }
        result = tmp;
        return result;

        function evalFeature(squares) {
            var j = 0,
                s = 0,
                M = squares.length,
                acc = [];
            s = board.get(squares[0]);
            acc.push(board.get(squares[j]) + '');
            for(j = 1; j < M; j += 1) {
                s *= 3;
                acc.push(board.get(squares[j]) + '');
                s += board.get(squares[j]);
            }
            // console.log(acc.join(''));
            return s;
        }


    };

    module.evaluateFeaturesForTraining = function (board) {
        var result = {},
            key,
            tmp;
        result.normal = objectMap(features, function(val) {
            return val.groups.map(evalFeature);
        });
        // tmp = {};
        // for(key in features) {
        //     if(features.hasOwnProperty(key)) {
        //         tmp[key] = features[key].groups.map(evalFeature);
        //     }
        // }
        // result.normal = tmp;
        tmp = {};
        for(key in features) {
            if(features.hasOwnProperty(key)) {
                tmp[key] = features[key].groups.map(
                    evalFeatureReverseColors);
            }
        }
        result.reversed = tmp;

        function evalFeatureReverseColors(squares) {
            var j = 0,
                s = 0,
                v,
                M = squares.length;
            for(j = 0; j < M; j += 1) {
                s *= 3;
                v = board.get(squares[j]);
                if(v) {
                    s += 3 - v;
                }
            }
            return s;
        }

        function evalFeature(squares) {
            var j = 0,
                s = 0,
                M = squares.length;
            s = board.get(squares[0]);
            for(j = 1; j < M; j += 1) {
                s *= 3;
                s += board.get(squares[j]);
            }
            return s;
        }

        return result;
    };

    module.featureSizes = objectMap({
        'd4': 4,
        'd5': 5,
        'd6': 6,
        'd7': 7,
        'd8': 8,
        'h2': 8,
        'h3': 8,
        'h4': 8,
        'edgex': 10,
        'b2x4': 8,
        'b3x3': 9}, function(x) { return Math.pow(3, x); });



    // Create the factors for a naive bayes classifier given a data
    // structure with win/loss counts.
    module.createBayesFactors = function (counts, featureSizes) {
        return objectMap(counts, function(table) {
            return objectMap(table.features, function(subtbl, key) {
                return calcTable(subtbl, 2*table.total, featureSizes[key]);
            });
        });


        function calcTable(smallCounts, total, featureSize) {
            var N = featureSize,
                alpha = 1,
                baseP = Math.log(alpha / (total + 2 * alpha)),
                // Set up the result to assume all values are missing.
                result = {w0: N * baseP,
                          table: {},
                          baseP: baseP},
                table = result.table;

            objectForEach(smallCounts, function(c, i) {
                var p = (c + alpha) / (total + 2 * alpha);
                result.w0 += Math.log(1 - p) - baseP;
                table[i] = Math.log(p / (1-p));
            });

            return result;
        }
    };

    // Find the score for a position defined by features using the
    // bayes factors in table.
    module.bayesScore = function (features, factors) {

        var winScores = fcn(features, factors.win);
        var loseScores = fcn(features, factors.lose);

        var win = objectReduce(winScores,
                               function(acc, x) { return acc + x;}, 0);
        var lose = objectReduce(loseScores,
                                function(acc, x) { return acc + x;}, 0);

        return win - lose;


        function fcn(features, factor) {
            return objectMap(features, function(values, key) {
                var fact = factor[key];
                return values.reduce(function(sum, f) {
                    var c = fact.table[f];
                    if(c === undefined) {
                        c = fact.baseP;
                    }
                    return sum + c;
                }, fact.w0);
            });
        }
    };

    function arrayInit(size, fcn) {
        var i,
            result = [];
        for(i = 0; i < size; i += 1) {
            result[i] = fcn(i);
        }
        return result;
    }

    module.createCounts = function() {
        var counts = {}, i;


        for(i = 0; i < 60; i += 1) {
            counts[Math.floor(i / 4)] = {
                win: {total: 0,
                      features: objectMap(features, function(val) {
                          return {};
                      })},
                lose: {total: 0,
                       features: objectMap(features, function(val) {
                           return {};
                       })}};
        }

        return counts;
    };

    // Update the counts for the features based on the score.
    // Expects a score from -INF to INF.
    module.updateCounts = function(fullFeatures, counts, score) {
        // All of the features have 2, 4, or 8 repeats, so we want to
        // make sure to update according to ... hmm, not sure now.
        // TODO
        var C = 8;
        var eps = 1e-2;
        var win, lose;
        if(score > eps) {
            win = counts.win;
            lose = counts.lose;
        } else if (score < -eps) {
            win = counts.lose;
            lose = counts.win;
        } else {
            return counts; // do nothing
        }
        update(fullFeatures.normal, win);
        update(fullFeatures.reversed, lose);

        return counts;

        function update(features, counts) {
            counts.total += C;
            objectForEach(features, function(values, key) {
                var inc = C / values.length,
                    chunk = counts.features[key];
                values.forEach(function(f) {
                    chunk[f] = (chunk[f] || 0) + inc;
                });
            });
        }
    };

    module.verifyCounts = function(counts) {
        // The total should equal the sum of each of the features.
        objectForEach(counts, function(subcounts, name) {
            var total = subcounts.total;
            objectForEach(subcounts.features, function(values) {
                var s = objectReduce(values, function(a, b) { return a + b; }, 0);
                if (s !== total) {
                    throw 'bad';
                }
            });
        });
        if(counts.win.total !== counts.lose.total) {
            throw 'bad';
        }
        // For each feature, the mirrored features should have the
        // same score.  This requires some knowledge of the mirroring...
    };

    module.BayesScore = function(bayesCounts) {
        this.counts = bayesCounts;
        this.factors = objectMap(this.counts, function(cnts) {
            return module.createBayesFactors(cnts,
                                             module.featureSizes);
        });
    };

    module.BayesScore.prototype = {
        score: function(board) {
            var features = module.evaluateFeatures(board),
                factors = this.lookupFactors(board),
                score = module.bayesScore(features, factors);
            if(board.player === my.WHITE) {
                score = -score;
            }
            return score;
        },
        // Adjust weights for board given the lookahead score.
        learn: function(board, score) {
            // Always wants to learn for black...
            // find features.
            // increment counts for features

            // For debug, evaluate the score before and after, and
            // make sure it moves in the right direction.
            var features = module.evaluateFeaturesForTraining(board);
            var factors = this.lookupFactors(board);
            var simpleFeatures = module.evaluateFeatures(board);
            var startScore = module.bayesScore(simpleFeatures,
                                               factors);

            module.updateCounts(features, this.lookupCounts(board), score);
            this.updateFactors(board);

            // reversi.bayesScore.verifyCounts(counts[0]);
            factors = this.lookupFactors(board);
            var endScore = module.bayesScore(simpleFeatures,
                                             factors);
            var a = ' ';
            var b = ' ';
            if(startScore * score < 0) {
                a = '*';
            }
            if(endScore * score < 0) {
                b = '*';
            }
            console.log(a + b + ' ' +
                        board.moveNumber  + ' p' + board.player +
                        '  startScore: ' + startScore.toFixed(2) +
                        ' endScore: ' + endScore.toFixed(2) +
                        ' score: ' + score.toFixed(2));
            // Check that the score has moved in the right direction
        },
        updateFactors: function (board)  {
            var idx = Math.floor(board.moveNumber / 4);
            this.factors[idx] = module.createBayesFactors(this.counts[idx],
                                                         module.featureSizes);
        },

        lookupFactors: function (board)  {
            var idx = Math.floor(board.moveNumber / 4);
            return this.factors[idx];
        },
        lookupCounts: function (board)  {
            var idx = Math.floor(board.moveNumber / 4);
            return this.counts[idx];
        }
    };

    module.LearningPlayer = function(learner, playStrategy,
                                     lookaheadStrategy) {
        this.learner = learner;
        this.playStrategy = playStrategy;
        this.lookaheadStrategy = lookaheadStrategy;
    };
    module.LearningPlayer.prototype = {
        getMove: function(board, cb) {
            var move = this.playStrategy.findMove(board),
                scoreMove = move;
            if(this.lookaheadStrategy) {
                scoreMove = this.lookaheadStrategy.findMove(board);
            }
            this.learner.learn(board, scoreMove.score);
            cb(move.move);
        }
    };
    return my;
} (reversi || {}));

/* phaseplayer.js */
/* globals define */

var reversi = (function(my) {
    'use strict';

    // This player switches to a longer view of the game towards the end.
    my.PhasePlayer = function (subplayers) {
        this.subplayers = subplayers;
    };

    my.PhasePlayer.prototype = {
        getMove: function(board, cb) {
            var move = this.findMove(board);
            cb(move.move);
        },

        findMove: function(board) {
            var N = this.subplayers.length,
                i;
            for(i = 0; i < N; i += 1) {
                if(this.subplayers[i][0] >= board.moveNumber) {
                    return this.subplayers[i][1].findMove(board);
                }
            }
            throw 'no player found...';
        }
    };
    return my;
}(reversi || {}));

/* semirandomplayer.js */
/* global console */

var reversi = (function(my) {
    'use strict';

    // This player uses the player passed in, but does a randomized selection.
    my.SemiRandom = function (player) {
        this.player = player;
    };
    my.SemiRandom.prototype = {
        getMove: function(board, cb) {
            var move = this.findMove(board);
            cb(move);
        },

        findMove: function(board) {
            var moves = board.legalMoves(board.player),
                N = moves.length,
                totalWeight = 0,
                w, i, move, bestMove, selected;
            console.group('findMove');
            for(i = 0; i < N; i += 1) {
                move = this.player.findMove(board.makeMove(moves[i],
                                                           board.player));
                w = 1/(1+ Math.exp(move.score));
                w = w * w;
                totalWeight += w;
                selected = false;
                if(Math.random() <= w / totalWeight) {
                    bestMove = moves[i];
                    selected = true;
                }
                console.log('move: %s\nscore: %s\nweight %s\nselected %s\ntotal %s', moves[i], -move.score, w, selected, totalWeight);
            }
            console.groupEnd('findMove');
            console.log('semi-random selected %o', bestMove);
            return {move: bestMove,
                    score: 1};

        }
    };
    return my;
}(reversi || {}));

/* uiplayer.js */
/* global module */
var reversi = (function(my) {

    'use strict';
    my.UIPlayer = function(color, display) {
        this.display = display;
        this.board = null;
        this.color = color;
    };

    my.UIPlayer.prototype = {
        getMove: function(board, cb) {
            var that = this;
            this.display.cb = function(r, c) {
                console.log('row: ' + r + ' col: ' + c);
                that.display.cb = null;
                cb(10 * c + r);
            };
        }
    };
    return my;
}(reversi || {}));


var reversi = (function(my) {
    'use strict';
    var v2_patterns = {};
    var base_patterns = [
        // diag8 only case that is not 8-way symmetric.
        [18, 27, 36, 45, 54, 63, 72, 81],
        // diag 5
        [15, 24, 33, 42, 51],
        // diag 6
        [16, 25, 34, 43, 52, 61],
        // diag 7
        [17, 26, 35, 44, 53, 62, 71],
        // row 1
        [11, 12, 13, 14, 15, 16, 17, 18],
        // row 2
        [21, 22, 23, 24, 25, 26, 27, 28],
        // row 3
        [31, 32, 33, 34, 35, 36, 37, 38],
        // row 4
        [41, 42, 43, 44, 45, 46, 47, 48],
        // 2x4
        [11, 12, 13, 14, 21, 22, 23, 24],
        // 2x5
        [11, 12, 13, 14, 15, 21, 22, 23, 24, 25],
        // edge+2x
        [11, 12, 13, 14, 15, 16, 17, 18, 22, 27]];

    function pow3(x) {
        var result = 1;
        if (x > 0) {
            while (x > 0) {
                result *= 3;
                x -= 1;
            }
        }
        return result;
    }

    function rot90(x) {
        let r = Math.floor(x / 10),
            c = x - r * 10;
        return c*10 + 9-r;
    }
    function flip(x) {
        let r = Math.floor(x / 10),
            c = x - r * 10;
        return r*10 + 9 - c;
    }


    function create_feature_indices() {
        let result = [], p = 0, pat, v, i;
        for(p = 0; p < base_patterns.length; ++p) {
            pat = base_patterns[p].slice();
            v = [];
            for(i = 0; i < 8; ++i) {
                if (p === 0 && i === 4) {
                    // only do four rots of first pat.
                    break;
                }
                // Flip on fourth iteration.
                if(i === 4) {
                    pat = pat.map(flip);
                }
                v.push(pat.slice());
                pat = pat.map(rot90);
            }
            result.push(v);
        }
        return result;
    }
    v2_patterns.create_feature_indices = create_feature_indices;

    var all_patterns = create_feature_indices();

    my.create_feature_offsets = function() {
        let count = 0, sizes = [], offsets = [];

        base_patterns.forEach(p => {
            let s = pow3(p.length);
            offsets.push(count);
            count += s;
            sizes.push(s);
        });
        return [sizes, offsets];
    };

    var feature_offsets, feature_sizes;

    (function() {
        var r = my.create_feature_offsets();
        feature_sizes = r[0];
        feature_offsets = r[1];
    }());

    function evaluate(pieces, pattern) {
        var f = (acc, idx) => acc * 3 + pieces[idx];
        return pattern.reduce(f, 0);
    }

    function evaluate_position(pieces) {
        let result = [];
        all_patterns.map((patterns, idx) => {
            let offset = feature_offsets[idx];
            patterns.forEach(pat => {
                result.push(evaluate(pieces, pat) + offset);
            });
        });
        return result;
    }
    v2_patterns.evaluate_position = evaluate_position;
    // var verbose = true;
    my.v2_patterns = v2_patterns;
    return my;
}(reversi || {}));
var reversi = (function(my) {
    'use strict';
    var v2_player = {};

    function logistic_eval(weights, keys) {
        return keys.reduce((acc, key) => acc + weights[key], 0);
    }

    function Player(weights, depth, random_weight) {
        this.random_weight = random_weight || 0;

        this.weights = weights;
        this.ab = new reversi.AlphaBeta6({maxDepth: depth,
                                          scoreFunction: board=>this.score(board),
                                          verbose: false});
    }

    Player.prototype = {
        score: function(board) {
            var keys = reversi.v2_patterns.evaluate_position(board.pieces()),
                weights = this.get_weights(board);
            // keys.forEach(k => { console.log(k + " " + weights[k]); });
            return logistic_eval(weights, keys) + Math.random() * this.random_weight;
        },

        get_weights: function(board) {
            var idx = Math.floor((board.moveNumber - 1)/ 4);
            return this.weights[idx];
        },

        findMove: function(board) {
            var result = this.ab.findMove(board);
            console.log('result: (depth %s) %s', this.ab.maxDepth,
                        result.score);
            return result;
        }
    };
    v2_player.Player = Player;
    my.v2_player = v2_player;
    return my;
}(reversi || {}));
