(function (module) {
/* globals module */
(function (my) {
    'use strict';

    var BLACK = 1,
        WHITE = 2,
        EMPTY = 0,
        allDirections = [-11, -10, -9, -1, 1, 9, 10, 11];

    my.allDirections = allDirections;
    my.BLACK = BLACK;
    my.WHITE = WHITE;
    my.EMPTY = EMPTY;

    function isValid(move) {
        return (move > 10 && move < 89 &&
                move % 10 > 0 && move % 10 < 9);
    }

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


    function Board () {
        var i = 0;
        this.N = 100;
        this.moveNumber = 0;
        this.data = [];
        this.player = BLACK;
        for(i = 0; i < this.N; i += 1) {
            this.data[i] = EMPTY;
        }
    }

    my.Board = Board;

    Board.prototype = {
        // hash: function() {
        //     var result = 0,
        //         i, v;
        //     for(i = 0; i < 100; i += 1) {
        //         v = this.data[i];
        //         if(v) {
        //             result = result ^ (hashKeys[i + 100 * (v - 1)]);
        //         }
        //     }
        //     return result  % 1001683;
        // },

        copy: function() {
            var result = new Board();
            result.data = this.data.slice();
            result.moveNumber = this.moveNumber;
            result.player = this.player;
            return result;
        },

        toString: function() {
            var result = [], i, j, p;
            for(i = 1; i < 9; i += 1) {
                for(j = 1; j < 9; j += 1) {
                    p = this.data[i * 10 + j];
                    if(p === BLACK) {
                        result.push('@');
                    } else if(p === WHITE) {
                        result.push('O');
                    } else {
                        result.push('.');
                    }
                }
                result.push('\n');
            }
            return result.join('');
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

        allSquares: (function() {
            var i, result = [];
            for(i = 11; i < 89; i += 1) {
                if(i % 10 > 0 && i % 10 < 9) {
                    result.push(i);
                }
            }

            return result;
        }()),


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

        // Make any flips in the given direction.
        makeFlips: function(move, player, dir) {
            var end = this.findBracketingPiece(move, player, dir);
            if(end !== 0) {
                for(; move !== end; move += dir) {
                    this.set(move, player);
                }
            }
        },
        // Moving DIR from SQUARE, return the piece owned by PLAYER
        // that occurs after a string of opponent pieces.
        //
        // Returns 0 if no such square is found.
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



} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, setTimeout */

(function (my) {
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
        this.moveRadius = this.pieceRadius / 4;

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
            colors[WHITE] = '#f8f8f8';
            colors[BLACK] = '#040404';
            var background = '#aaa';

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
            this.ctx.lineStyle = '#040404';
            for(i = 0; i < this.lineXs.length; i += 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.lineXs[i], 0);
                this.ctx.lineTo(this.lineXs[i], this.height);
                this.ctx.stroke();
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
                        fill = colors[player];
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


} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console, window */

(function (my) {
    'use strict';
    var BLACK = my.BLACK,
        WHITE = my.WHITE;

    function Game(player1, player2, display, status,
                  gameOverCb) {
        this.player1 = player1;
        this.player2 = player2;
        this.display = display;
        this.player = BLACK;
        this.board = my.getInitialBoard();
        this.lastTime = new Date();
        this.status = status;
        this.gameOverCb = gameOverCb;

    }

    Game.prototype = {
        play: function() {
            var newBoard = this.board.copy(),
                that = this;
            this.lastTime = new Date();

            if(this.display) {
                this.display.board = this.board;
                this.display.draw();
            }
            if(this.player === BLACK) {
                this.player1.getMove(newBoard, function(move) {
                    that.doMove(BLACK, move);
                });
            } else {
                this.player2.getMove(newBoard, function(move) {
                    that.doMove(WHITE, move);
                });
            }
        },

        doMove: function(player, move) {
            var that = this,
                newBoard, r,
                delay;
            try {
                if(this.board.isLegal(move, player)) {
                    // console.log('move ' + move);
                    newBoard = this.board.makeMove(move, player);
                    this.board = newBoard;
                    this.display.board = this.board;
                    if(this.display) {
                        this.display.draw();
                    }
                    if(this.status) {
                        var i, b = 0, w = 0;
                        for(i = 0; i < 100; i += 1) {
                            if(this.board.data[i] === BLACK) {
                                b += 1;
                            } else if (this.board.data[i] === WHITE) {
                                w += 1;
                            }
                        }
                        this.status.innerText = 'Black: ' + b + '  White: ' +
                            w;
                    }

                    r = newBoard.isOver();
                    if(r.over) {
                        console.log('game over');
                        this.status.innerHTML = 'GAME OVER score for black: ' +
                            newBoard.countDifference(BLACK);
                        if(this.gameOverCb) { this.gameOverCb(newBoard); }
                    } else {
                        this.player = newBoard.nextToPlay(this.player);
                        delay = 50;
                        // Math.max(, 50 - (new Date() - this.lastTime));
                        window.setTimeout(function() {
                            that.play();
                        }, delay);
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


} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module */

(function (my) {
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

} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module */

(function (my) {
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


} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console */

(function (my) {
    'use strict';
    var opponent = my.opponent;

    function AlphaBeta(depth, fcn) {
        this.depth = depth;
        this.fcn = fcn;
        this.log = [];
        this.count = 0;
    }

    AlphaBeta.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },

        findMove: function(board) {
            var best;
            this.log = ['starting'];

            this.count = 0;
            best = this.search(board.player, board, -Infinity, Infinity,
                               this.depth);
            console.log('did ' + this.count + ' calls to search');
            this.log.push('ending score ' + best.score);
            // console.log('best move: ' + best.move + ' score: ' + best.score);
            return best;
        },

        search: function(player, board, achievable, cutoff, depth) {
            var keep = this.log;

            this.log = ['entering, player ' + player +
                         ' depth ' + depth +
                        ' achievable ' + achievable +
                       '  cutoff ' + cutoff];
            var s = this.searchBody(player, board, achievable, cutoff, depth);
            this.log.push(['exiting score', s]);
            keep.push(this.log);
            this.log = keep;
            return s;
        },

        searchBody: function(player, board, achievable, cutoff, depth) {
            var moves,
                that = this,
                opp = opponent(player),
                s,
                i, newBoard,
                best = {score: achievable,
                        move: 'cutoff',
                        player: player},
                newDepth;
            this.count += 1;

            if(depth === 0) {
                s = board.isOver(player);
                if(s.over) {
                    return s;
                } else {
                    return {score: this.fcn(board, player),
                            move: 'depth reached',
                            player: player};
                    }
            }

            moves = board.legalMoves(player);

            if(depth === this.depth) {
                // Mix up the order to make the games more unique.
                my.shuffleArray(moves);
            }

            if(moves.length === 0) {
                if(board.anyLegalMove(opponent(player))) {
                    s = this.search(opponent(player), board, -cutoff,
                                    -achievable, depth);
                    return {score: -s.score,
                            move: 'no move',
                            child: s,
                            player: player
                           };
                } else {
                    s = board.isOver(player);
                    return s;
                }
            } else {
                newDepth = depth - 1;
                // Simple quiessence search.
                if(moves.length === 1) {
                    newDepth = depth;
                }
                for(i = 0; i < moves.length; i += 1) {
                    newBoard = board.makeMove(moves[i], player);
                    s = that.search(opp, newBoard, -cutoff,
                                    -best.score, depth - 1);
                    if(-s.score > best.score) {
                        best = {
                            score: -s.score,
                            move: moves[i],
                            child: s
                        };
                    }
                    if(best.score >= cutoff) {
                        break;
                    }
                }
                best.player = player;
                return best;
            }
        }

    };
    my.AlphaBeta = AlphaBeta;



} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console */

(function (my) {
    'use strict';
    var verbose = false;
    function AlphaBeta6(options) {
        this.maxDepth = options.maxDepth || 64;
        this.maxTime = options.maxTime || 60000; // Just to keep it from running forever
        this.fcn = options.scoreFunction;
        this.verbose = options.verbose;
    }

    AlphaBeta6.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },

        findMove: function(board) {
            var best, pv, newBest;

            this.count = 0;
            pv = null;
            this.startTime = null;
            best = this.search(board.player, board, -Infinity,
                               Infinity, 1, pv);
            this.startTime = new Date();

            try  {
                for(var depth = 2; depth <= this.maxDepth; depth += 1) {
                    this.depth = depth;
                    newBest = this.search(board.player, board, -Infinity,
                                          Infinity, depth, pv);
                    best = newBest;
                    if(this.verbose) {
                        console.log('player ' + board.player +
                                    ' best at depth ' + depth + ' score ' +
                                    best.score + ' move ' + best.move);
                    }
                    pv = best.pv;

                    // TODO: this isn't catch what we think it is catching..

                    if(best.over) {
                        break;
                    }
                }
            } catch (e) {
                if(e.timeout) { console.log('timed out...'); }
                else { throw(e); }
            }
            if(this.verbose) {
                console.log('did ' + this.count + ' calls to search');
            }
            // console.log('player ' + board.player +
            //             ' best at depth ' + depth + ' score ' +
            //             best.score + ' move ' + best.move);
            return best;
        },


        search: function(player, board, achievable, cutoff, depth, pv) {
            var moves,
                that = this,
                opp = my.opponent(player),
                s,
                i, newBoard,
                best = {score: achievable,
                        move: 'cutoff',
                        player: player},
                newDepth;

            this.count += 1;
            if(depth === 0) {
                s = board.isOver(player);
                if(s.over) {
                    return s;
                } else {
                    return {score: this.fcn(board, player),
                            move: 'depth reached',
                            player: player,
                            pv: null};
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
                                    -achievable, depth, pv);
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
                    s = that.search(opp, newBoard, -cutoff,
                                    -best.score, newDepth - 1, pv);
                    pv = [];
                    if(-s.score > best.score) {
                        best = {
                            score: -s.score,
                            move: moves[i],
                            child: s,
                            pv: [moves[i]].concat(s.pv),
                            over: s.over
                        };
                    }
                    if(best.score >= cutoff) {
                        break;
                    }
                }
                best.player = player;
                return best;
            }
        }
    };
    my.AlphaBeta6 = AlphaBeta6;



} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module */

(function (my) {
    'use strict';
    function RandomPlayer () {
        this.ab = new my.AlphaBeta(8, my.countDifference);
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


} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console */

(function (my) {
    'use strict';
    var module = my.bayesLearner = {};

    module.bayesCalcW = function (categoryCounts, N, alpha, beta) {
        var M = categoryCounts.length,
            result = {ws: [], w0: 0},
            i, t;

        for(i = 0; i < M; i += 1) {
            t = (categoryCounts[i] + alpha) / (N + beta);
            result.w0 += Math.log(1 - t);
            result.ws[i] = Math.log(t / (1 - t));
        }
        return result;
    };

    module.bayes = function(yes, no, x) {
        var N = x.length,
            yesW = yes.w0,
            noW = no.w0,
            i = 0;

        for(i = 0; i < N; i += 1) {
            yesW += x[i] * yes.ws[i];
            noW += (1-x[i]) * no.ws[i];
        }
        console.log('yesW :' + yesW);
        console.log('noW :' + noW);
        return Math.exp(yesW) / (Math.exp(yesW) + Math.exp(noW));

    };

    /// Build a table mapping the result of flipping the order of the
    /// squares.
    var reverseOrderTable = (function() {
        var table = {},
            N = 4,
            result,
            i, n, x,
            j,
            limit;
        for(N = 4; N < 11; N += 1) {
            result = [];
            limit = Math.pow(3, N);
            for(i = 0; i < limit; i += 1) {
                x = 0;
                n = i;
                for(j = 0; j < N; j += 1) {
                    x *= 3;
                    x += (n % 3);
                    n = Math.floor(n / 3);
                }
                result[i] = x;
            }
            for(i = 0; i < limit; i += 1) {
                if(result[result[i]] !== i) {
                    throw 'bad value at ' + i;
                }
            }
            table[N] = result;
        }
        return table;
    }());
    module.reverseOrderTable = reverseOrderTable;


    /// Rotate the board 90 degrees clockwise.
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


    /// Rotate the board 90 degrees clockwise.
    module.rotateBoard = function (board) {
        var r,
            c,
            s,
            newBoard = board.copy();
        for(r = 1; r < 9; r += 1) {
            for(c = 1; c < 9; c+= 1) {
                s = r * 10 + c;
                newBoard.set(module.rotate(s),
                             board.get(s));
            }
        }

        return newBoard;
    };

    // Only need the first half of the features for position evaluation.
    var features = (function () {
        var initial = {
            'd4': {groups: [[14, 23, 32, 41]]},
            'd5': {groups: [[15, 24, 33, 42, 51]]},
            'd6': {groups: [[16, 25, 34, 43, 52, 61]]},
            'd7': {groups: [[17, 26, 35, 44, 53, 62, 71]]},
            'd8': {groups: [[18, 27, 36, 45, 54, 63, 72, 81]]},
            'h2': {groups: [[21, 22, 23, 24, 25, 26, 27, 28]]},
            'h3': {groups: [[31, 32, 33, 34, 35, 36, 37, 38]]},
            'h4': {groups: [[41, 42, 43, 44, 45, 46, 47, 48]]},
            'edge+x': {groups: [[11, 22, 12, 13, 14, 15, 16, 17, 27, 18]]},
            '2x4': {groups: [[11, 12, 13, 14, 21, 22, 23, 24]]},
            '3x3': {groups: [[11, 12, 13, 21, 22, 23, 31, 32, 33]]}
        },
            i,
            key, groups;

        for(key in initial) {
            if(initial.hasOwnProperty(key) ) {
                groups = initial[key].groups[0];
                initial[key].size = groups.length;
                for(i = 0; i < 3; i += 1) {
                    groups = groups.map(module.rotate);
                    initial[key].groups.push(groups);
                }
                initial[key].v = 1;

                if(key !== 'd8') {
                    for(i = 0; i < 4; i += 1) {
                        groups = initial[key].groups[i].map(module.flip);
                        initial[key].groups.push(groups);
                    }
                } else {
                    initial[key].v = 2;
                }

            }
        }
        return initial;
    }());

    module.features = features;

    module.evaluateFeatures = function (board) {
        var result = {},
            key,
            tmp, i, N;

        tmp = {};
        for(key in features) {
            if(features.hasOwnProperty(key)) {
                if(key === '2x4') {
                    tmp[key] = features[key].groups.map(evalFeature);
                } else {
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

    module.evaluateFeaturesForTraining = function (board) {
        var result = {},
            key,
            tmp;

        tmp = {};
        for(key in features) {
            if(features.hasOwnProperty(key)) {
                tmp[key] = features[key].groups.map(evalFeature);
            }
        }
        result.normal = tmp;
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

    var featureSizes = {
        'd4': 4,
        'd5': 5,
        'd6': 6,
        'd7': 7,
        'd8': 8,
        'h2': 8,
        'h3': 8,
        'h4': 8,
        'edge+x': 10,
        '2x4': 8,
        '3x3': 9};



    my.createBayesFactors = function (weights) {
        var key,
            alpha = 1,
            wins = weights.wins,
            losses = weights.losses,
            featureKeys = Object.keys(weights.winCounts),
            fidx,
            factors = {win: {},
                       loss: {}};

        // For each key in weights, create a w_0 that is the value
        // without any features, and an array of values that get added
        // to the score if a feature is a present.

        // TODO: check that the keys in features are in winCounts and
        // lossCounts.

        for(fidx = 0; fidx < featureKeys.length; fidx += 1) {
            key = featureKeys[fidx];
            factors.win[key] = calcTable(wins, weights.winCounts[key],
                                         featureSizes[key]);
            factors.loss[key] = calcTable(losses, weights.lossCounts[key],
                                          featureSizes[key]);
        }

        return factors;

        function calcTable(total, counts, featureSize) {
            var N = Math.pow(3, featureSize),
                i, c,
                p,
                result = {w0: 0,
                          table: []},
                table = result.table;

            // Probably better to make this sparse too...
            for(i = 0; i < N; i += 1) {
                c = counts[i] || 0;
                p = (c + alpha) / (total + 2 * alpha);
                result.w0 += Math.log(1-p);
                table[i] = Math.log(p / (1 - p));
            }
            return result;
        }
    };


    function bayesScore(features, table) {
        var featureKeys = Object.keys(features),
            N = featureKeys.length,
            pWin = xyz(table.win),
            pLoss = xyz(table.loss);
        return pWin - pLoss;
        // Bigger is better in this case.  To get a probability,
        // the caller would have to do 1/ (1 + exp(-x))

        // return 1 / (1 + Math.exp(pLoss - pWin));

        function xyz(tbl) {
            var key,
                i, v, c,
                fidx,
                result = 0,
                weights,
                fs;

            for(fidx = 0; fidx < N; fidx += 1) {
                key = featureKeys[fidx];
                weights = tbl[key];
                result += weights.w0;
                fs = features[key];

                for(i = 0; i < fs.length; i += 1) {
                    v = fs[i];
                    c = weights.table[v];
                    if(c === undefined) {
                        throw 'bad';
                    }
                    result += c;
                }
            }
            return result;
        }
    }

    // Calculate the probability of winning, based on the score.
    module.scoreFeatures = function (features, weights) {
        // TODO: we are looking at twice as many features as we have
        // to.
        return bayesScore(features, weights);
    };

    module.createWeights = function() {
        var weights = {},
            key, i, N, chunk;
        function zeros(size) {
            var i,
                result = [];
            for(i = 0; i < size; i += 1) {
                result[i] = 0;
            }
            return result;
        }
        for(i = 0; i < 60; i += 1) {
            chunk =  weights[Math.floor(i / 4)] = {
                wins: 0, losses: 0,
                winCounts: {},
                lossCounts: {}
            };
            for(key in features) {
                if(features.hasOwnProperty(key)) {
                    N = Math.pow(3,features[key].size);
                    chunk.winCounts[key] = zeros(N);
                    chunk.lossCounts[key] = zeros(N);
                }
            }
        }
        return weights;

    };

    // Update the weights for the features based on the score.
    module.updateWeights = function(fullFeatures, weights, score) {
        var C = 8;

        if(score > 0.51) {
            updateWinner(fullFeatures.normal, weights);
            updateLoser(fullFeatures.reversed, weights);
        } else if (score < 0.49) {
            updateWinner(fullFeatures.reversed, weights);
            updateLoser(fullFeatures.normal, weights);
        }

        function updateWinner(features, weights) {
            var key, inc, chunk, i;
            weights.wins += C;
            for(key in features) {
                if(features.hasOwnProperty(key)) {
                    inc = C / features[key].length;
                    chunk = weights.winCounts[key];
                    for(i = 0; i < features[key].length; i += 1) {
                        chunk[features[key][i]] =
                            (chunk[features[key][i]] || 0) + inc;
                    }
                }
            }
        }

        function updateLoser(features, weights) {
            weights.losses += C;
            var key, inc, chunk, i;
            for(key in features) {
                if(features.hasOwnProperty(key)) {
                    inc = C / features[key].length;
                    chunk = weights.lossCounts[key];
                    for(i = 0; i < features[key].length; i += 1) {
                        chunk[features[key][i]] =
                            (chunk[features[key][i]] || 0) + inc;
                    }
                }
            }
        }

        return weights;
    };


    module.BayesPlayer = function(weights, depth, time) {
        this.weights = weights || module.createWeights();
        this.factors = [];
        this.depth = depth || 4;
        this.maxTime = time || 1;
        var that = this;

        /// TODO: differentiate game ending scores and position
        /// evaluations.
        function search(board) {
            var fs = module.evaluateFeatures(board),
                factors = that.factors[Math.floor(board.moveNumber / 4)],
                score = module.scoreFeatures(fs, factors);
            if(board.player === 1) {
                return (score - 0.5);
            } else {
                return 0.5 - score;
            }
        }

        this.searcher = new my.AlphaBeta5(this.maxTime, search);
        this.longSearcher = this.searcher;
        this.updateFactors();

    };

    module.BayesPlayer.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },

        // search: function(board) {
        //     var fs = module.evaluateFeatures(board),
        //         weights = this.weights[Math.floor(board.moveNumber / 4)],
        //         score = module.scoreFeatures(fs, weights);
        //     return (score - 0.5);
        // },
        updateFactors: function() {
            var key;
            this.factors = {};
            for(key in this.weights) {
                if(this.weights.hasOwnProperty(key)) {
                    this.factors[key] = reversi.createBayesFactors(
                        this.weights[key]);
                }

            }
        },

        // findMove: function (board) {
        //     // evaluate current board
        //     board = board.copy();
        //     var move;
        //     if(board.moveNumber > 51) {
        //         // Search further out at the end game.
        //         move = this.longSearcher.findMove(board);
        //     } else {
        //         move = this.searcher.findMove(board);
        //     }
        //     return move;
        // },
        findMove1: function(board) {
            return {move: board.legalMoves(board.player)[0],
                    player: board.player};
        },

        findMove: function (board) {
            // evaluate current board
            board = board.copy();
            // this.updateFactors();
            var move;
            if(board.moveNumber > 51) {
                // Search further out at the end game.
                move = this.longSearcher.findMove(board);
            } else {
                move = this.searcher.findMove(board);
            }
            // console.log('score ' + move.score.toFixed(3) + ' move ' +
            //             board.moveNumber + '  player ' + board.player);
            return move;
        },


        learn: function (board, score) {
            // evaluate current board
            board = board.copy();
            if(score === 0) {

            }
            // this.updateFactors();
            var moveIndex = Math.floor(board.moveNumber / 4),
                factors = this.factors[moveIndex],
                ws = this.weights[moveIndex],
                features = module.evaluateFeatures(board),
                fullFeatures = module.evaluateFeaturesForTraining(board),
                // Use search to re-evaluate.
                startScore,
                value = 0.5,
                endScore;

            startScore = module.scoreFeatures(features, factors);
            if(board.player === 2) { startScore = -startScore; }

            // console.log('start score: ' + startScore.toFixed(3));
            // console.log('evaluated score: ' + move.score);
            value = 0.5;

            if(score < 0) { value = 0; }
            else if(score > 0) { value = 1; }

            // Update the weights.
            if(board.player === 1) {
                module.updateWeights(fullFeatures, ws, value);
            } else {
                module.updateWeights(fullFeatures, ws, 1-value);
            }
            this.factors[moveIndex] = reversi.createBayesFactors(
                this.weights[moveIndex]);

            this.updateFactors();
            endScore = module.scoreFeatures(features, this.factors[moveIndex]);
            if(board.player === 2) { endScore = -endScore; }
            var t = '';
            if(score * startScore < 0) { t += '*';} else {t += ' '; }
            if(score * endScore < 0) { t += '*';}  else {t += ' '; }

            console.log(t + 'start ' + startScore.toFixed(3) + ' end ' +
                        endScore.toFixed(3) + ' diff ' +
                        (endScore  - startScore).toFixed(3) + '  search ' +
                        score.toFixed(3) + ' move ' + board.moveNumber +
                        '  player ' + board.player);
            // console.log('end score: ' + endScore.toFixed(3));
            // console.log('difference ' + (startScore - endScore).toFixed(3));
            // evaluate again (for testing)
            return (endScore * score);
        }

    };


    module.learn = function (board, score, counts) {
        // evaluate current board
        board = board.copy();
        if(score === 0) {

        }
        // this.updateFactors();
        var moveIndex = Math.floor(board.moveNumber / 4),
            factors = module.updateAllFactors(counts),
            scoreFcn = module.bayesScoreFunction(factors),
            // features = module.evaluateFeatures(board),
            fullFeatures = module.evaluateFeaturesForTraining(board),
            // Use search to re-evaluate.
            startScore,
            value = 0.5,
            endScore;

        startScore = scoreFcn(board);

        console.log('start score: ' + startScore.toFixed(3));
        console.log('evaluated score: ' + score);
        value = 0.5;

        if(score < 0) { value = 0; }
        else if(score > 0) { value = 1; }

        // Update the weights.
        if(board.player === 1) {
            module.updateWeights(fullFeatures, counts, value);
        } else {
            module.updateWeights(fullFeatures, counts, 1-value);
        }

        factors = module.updateAllFactors(counts);
        scoreFcn = module.bayesScoreFunction(factors),
        endScore = scoreFcn(board);
        var t = '';
        if(score * startScore < 0) { t += '*';} else {t += ' '; }
        if(score * endScore < 0) { t += '*';}  else {t += ' '; }

        console.log(t + 'start ' + startScore.toFixed(3) + ' end ' +
                    endScore.toFixed(3) + ' diff ' +
                    (endScore  - startScore).toFixed(3) + '  search ' +
                    score.toFixed(3) + ' move ' + board.moveNumber +
                    '  player ' + board.player);
        // console.log('end score: ' + endScore.toFixed(3));
        // console.log('difference ' + (startScore - endScore).toFixed(3));
        // evaluate again (for testing)
        return (endScore * score);
    };


    module.updateAllFactors = function(allWeights) {
        var key,
            factors = {};

        for(key in allWeights) {
            if(allWeights.hasOwnProperty(key)) {
                factors[key] = my.createBayesFactors(
                    allWeights[key]);
            }
        }
        return factors;
    },


    module.bayesScoreFunction = function(allFactors) {
        return function(board) {
            var features = module.evaluateFeatures(board),
                factors = allFactors[Math.floor(board.moveNumber / 4)],
                score = module.scoreFeatures(features, factors);
            if(board.player === 1) {
                return score;
            } else {
                return -score;
            }
        };
    };


    // module.BayesPlayer.prototype = {
    //     getMove: function(board, cb) {
    //         var best = this.findMove(board);
    //         cb(best.move);
    //     },

    //     // search: function(board) {
    //     //     var fs = module.evaluateFeatures(board),
    //     //         weights = this.weights[Math.floor(board.moveNumber / 4)],
    //     //         score = module.scoreFeatures(fs, weights);
    //     //     return (score - 0.5);
    //     // },
    //     updateFactors: function() {
    //         var key;
    //         this.factors = {};
    //         for(key in this.weights) {
    //             if(this.weights.hasOwnProperty(key)) {
    //                 this.factors[key] = reversi.createBayesFactors(
    //                     this.weights[key]);
    //             }

    //         }
    //     },

    //     findMove: function (board) {
    //         // evaluate current board
    //         board = board.copy();
    //         // this.updateFactors();
    //         var move;
    //         if(board.moveNumber > 51) {
    //             // Search further out at the end game.
    //             move = this.longSearcher.findMove(board);
    //         } else {
    //             move = this.searcher.findMove(board);
    //         }
    //         // console.log('score ' + move.score.toFixed(3) + ' move ' +
    //         //             board.moveNumber + '  player ' + board.player);
    //         return move;
    //     },


    //     learn: function (board, score) {
    //         // evaluate current board
    //         board = board.copy();
    //         if(score === 0) {

    //         }
    //         // this.updateFactors();
    //         var moveIndex = Math.floor(board.moveNumber / 4),
    //             factors = this.factors[moveIndex],
    //             ws = this.weights[moveIndex],
    //             features = module.evaluateFeatures(board),
    //             fullFeatures = module.evaluateFeaturesForTraining(board),
    //             // Use search to re-evaluate.
    //             startScore,
    //             value = 0.5,
    //             endScore;

    //         startScore = module.scoreFeatures(features, factors);
    //         if(board.player === 2) { startScore = -startScore; }

    //         // console.log('start score: ' + startScore.toFixed(3));
    //         // console.log('evaluated score: ' + move.score);
    //         value = 0.5;

    //         if(score < 0) { value = 0; }
    //         else if(score > 0) { value = 1; }

    //         // Update the weights.
    //         if(board.player === 1) {
    //             module.updateWeights(fullFeatures, ws, value);
    //         } else {
    //             module.updateWeights(fullFeatures, ws, 1-value);
    //         }
    //         this.factors[moveIndex] = reversi.createBayesFactors(
    //             this.weights[moveIndex]);

    //         this.updateFactors();
    //         endScore = module.scoreFeatures(features, this.factors[moveIndex]);
    //         if(board.player === 2) { endScore = -endScore; }
    //         var t = '';
    //         if(score * startScore < 0) { t += '*';} else {t += ' '; }
    //         if(score * endScore < 0) { t += '*';}  else {t += ' '; }

    //         console.log(t + 'start ' + startScore.toFixed(3) + ' end ' +
    //                     endScore.toFixed(3) + ' diff ' +
    //                     (endScore  - startScore).toFixed(3) + '  search ' +
    //                     score.toFixed(3) + ' move ' + board.moveNumber +
    //                     '  player ' + board.player);
    //         // console.log('end score: ' + endScore.toFixed(3));
    //         // console.log('difference ' + (startScore - endScore).toFixed(3));
    //         // evaluate again (for testing)
    //         return (endScore * score);
    //     }
    // };
} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console */

(function (my) {
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
        for(key in initial) {
            if(initial.hasOwnProperty(key) ) {
                groups = initial[key].groups[0];
                initial[key].size = groups.length;
                for(i = 0; i < 3; i += 1) {
                    groups = groups.map(module.rotate);
                    initial[key].groups.push(groups);
                }
                initial[key].v = 1;

                // Do the flips at the end, so they are all together
                // in the table.  d8 has only two instances though,
                // not 8, so we don't want to flip it again.

                if(key !== 'd8') {
                    for(i = 0; i < 4; i += 1) {
                        groups = initial[key].groups[i].map(module.flip);
                        initial[key].groups.push(groups);
                    }
                } else {
                    initial[key].v = 2;
                }

            }
        }
        return initial;
    }());


    // Find the features for the current board.
    module.evaluateFeatures = function (board) {
        var result = {},
            key,
            tmp, i, N;

        tmp = {};
        for(key in features) {
            if(features.hasOwnProperty(key)) {
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
                M = squares.length;
            s = board.get(squares[0]);
            for(j = 1; j < M; j += 1) {
                s *= 3;
                s += board.get(squares[j]);
            }
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

        // var tmp = objectMap(features, function(val, key) {
        //     // if(factors.win[key].w0 !== factors.lose[key].w0) {
        //     //     throw 'bad';
        //     // }
        //     var result = val.reduce(function(acc, f) {
        //         var a = factors.win[key].table[f];
        //         var b = factors.lose[key].table[f];
        //         if(a === undefined) { a = factors.win[key].baseP; }
        //         if(b === undefined) { b = factors.win[key].baseP; }
        //         if(a !== b) {
        //             acc.push({key: key, val: f, win: a, lose: b});
        //         }
        //         return acc;
        //     }, []);
        //     return result;
        // });

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

    // // Calculate the probability of winning, based on the score.
    // module.scoreFeatures = function (features, weights) {
    //     // TODO: we are looking at twice as many features as we have
    //     // to.
    //     return bayesScore(features, weights);
    // };

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

} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module */

(function (my) {
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



} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module */

(function (my) {
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
                w, i, move, bestMove;

            for(i = 0; i < N; i += 1) {
                move = this.player.findMove(board.makeMove(moves[i],
                                                           board.player));
                w = 1/(1+ Math.exp(move.score));
                totalWeight += w;
                if(Math.random() <= w / totalWeight) {
                    bestMove = moves[i];
                }
            }
            return {move: bestMove,
                    score: 1};
        }
    };




} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
/* globals module, console */

(function (my) {
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

} ((typeof module !== 'undefined' && module) ||
   (this.reversi = this.reversi || {})));
}((typeof module !== 'undefined' && module.exports) ||
  (this.reversi = this.reversi || {})));
