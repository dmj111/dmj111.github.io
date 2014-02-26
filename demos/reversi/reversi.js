/* jshint strict: true, unused:true, undef:true, browser:true */
/* globals  exports,  console, setTimeout  */

// Javascript Othello, ported from <a
// href="http://norvig.com/paip/othello.lisp"> Peter Norvig's Lisp
// code </a>.  Here is his <a href="http://norvig.com/license.html">
// license</a>, so I will put this under the same thing.

(function(exports) {
    'use strict';

    var hashKeys = (function(){
        var i, N = 200,
            M = Math.pow(2, 31),
            result = [];
        for(i = 0; i < 200; i += 1) {
            result[i] = (Math.random() * M) | 0;
        }
        return result;
    }());

    var BLACK = 1,
        WHITE = 2,
        EMPTY = 0,
        reversi = {BLACK: BLACK,
                   WHITE: WHITE,
                   EMPTY: EMPTY},
        allDirections = [-11, -10, -9, -1, 1, 9, 10, 11];

    function shuffleArray(array) {
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

    function Board() {
        var i = 0;
        this.N = 100;
        this.moveNumber = 0;
        this.data = [];
        this.player = BLACK;
        for(i = 0; i < this.N; i += 1) {
            this.data[i] = EMPTY;
        }
    }

    Board.prototype = {
        hash: function() {
            var result = 0,
                i, v;
            for(i = 0; i < 100; i += 1) {
                v = this.data[i];
                if(v) {
                    result = result ^ (hashKeys[i + 100 * (v - 1)]);
                }
            }
            return result  % 1001683;;
        },

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

        toHex: function() {
            var that = this;
            function getPlayerCode(p) {
                var codes = [],
                    code,
                    r, c;
                for(r = 1; r < 9; r += 2) {
                    code = 0;
                    for(c = 1; c < 9; c += 1) {
                        code = code * 2;
                        if(that.data[r * 10 + c] === p) {
                            code += 1;
                        }
                    }
                    codes.push(code);
                }
                return String.fromCharCode.apply(String, codes);
            }
            return getPlayerCode(1) + getPlayerCode(2);
        },

        // fromHex: function(hex) {
        //     var board = new Board();
        // },


        get: function(square) {
            return this.data[square];
        },

        set: function(square, v) {
            this.data[square] = v;
        },

        allSquares: [],

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

    function getInitialBoard() {
        var result = new Board();
        result.set(44, WHITE);
        result.set(45, BLACK);
        result.set(54, BLACK);
        result.set(55, WHITE);
        return result;
    }

    reversi.getInitialBoard = getInitialBoard;

    (function() {
        var i;
        for(i = 11; i < 89; i += 1) {
            if(i % 10 > 0 && i % 10 < 9) {
                Board.prototype.allSquares.push(i);
            }
        }

    }());

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
            colors[WHITE] = "#f8f8f8";
            colors[BLACK] = "#040404";
            var background = "#aaa";

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

    reversi.Display = Display;

    function isValid(move) {
        return (move > 10 && move < 89 &&
                move % 10 > 0 && move % 10 < 9);
    }

    function Game(player1, player2, display, status,
                  gameOverCb) {
        this.player1 = player1;
        this.player2 = player2;
        this.display = display;
        this.player = BLACK;
        this.board = getInitialBoard();
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
                        this.status.innerHTML = 'score for black: ' +
                            newBoard.countDifference(BLACK);
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
    reversi.Game = Game;

    function RandomPlayer () {
        this.ab = new AlphaBeta(8, reversi.countDifference);
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
            shuffleArray(moves);
            return {move: moves[0], player: board.player};
        }
    };

    reversi.RandomPlayer = RandomPlayer;

    function Maximizer(player, fcn) {
        this.player = player;
        this.fcn = fcn;
    }

    Maximizer.prototype.getMove = function(board, cb) {
        var moves = board.legalMoves(this.player),
            that = this,
            best;
        shuffleArray(moves);
        best = moves.reduce(function(best, move) {
            var s = that.fcn(board, that.player);
            if(s > best.score) {
                return {move: move, score: s};
            } else {
                return best;
            }
        }, {move: -1,
            score: -Infinity});
        cb(best.move);
    };
    reversi.Maximizer = Maximizer;

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
        var opp = opponent(player),
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
    reversi.weightedDifference = weightedDifference;

    reversi.modifiedWeightedDifference = function(board, player) {
        var w = weightedDifference(board, player),
            corners = [11, 18, 81, 88],
            opp = opponent(player);
        return corners.reduce(function(w, square) {
            if(board.get(w) !== EMPTY) {
                return allDirections.reduce(function(w, dir) {
                    var s = dir + square,
                        p = board.get(s);
                    if(p === player) {
                        return w - (5 - weights[s]);
                    } else if (p == opp) {
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

    reversi.mobility = function(board, player) {
        return board.legalMoves(player).length -
            board.legalMoves(opponent(player)).length;
    };

    reversi.countDifference = function(board, player ) {
        return board.countDifference(player);
    };

    function Minimax(depth, fcn) {
        this.depth = depth;
        this.fcn = fcn;
    }

    Minimax.prototype = {
        getMove: function(board, cb) {
            var moves = board.legalMoves(this.player),
                opp = opponent(board.player),
                bestScore = -Infinity,
                bestMove, i, s, newBoard;
            // shuffleArray(moves);
            for(i = 0; i < moves.length; i += 1) {
                newBoard = board.makeMove(moves[i], this.player);
                s = -this.search(opp, newBoard, this.depth - 1);
                if(s > bestScore) {
                    bestScore = s;
                    bestMove = moves[i];
                }
            }
            cb(bestMove);
        },
        search: function(player, board, depth) {
            var moves,
                that = this,
                opp = opponent(player),
                s;
            if(depth === 0) {
                return this.fcn(board, player);
            }

            moves = board.legalMoves(player);
            if(moves.length === 0) {
                if(board.anyLegalMove(opponent(player))) {
                    s = -this.search(opponent(player), board, depth-1);
                    return s;
                } else {
                    s = board.isOver(player).score;
                    return s;
                }
            } else {
                return moves.reduce(function(bestScore, move) {
                    var s,
                        newBoard = board.makeMove(move, player);
                    s = -that.search(opp, newBoard, depth - 1);
                    return Math.max(s, bestScore);
                }, -Infinity);
            }
        }

    };
    reversi.Minimax = Minimax;

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
                shuffleArray(moves);
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
    reversi.AlphaBeta = AlphaBeta;




    function negateNode(node) {
        node.score = -node.score;
        return node;
    }

    function AlphaBeta2(player, depth, fcn) {
        this.depth = depth;
        this.player = player;
        this.fcn = fcn;
        this.ab = new AlphaBeta(player, depth, fcn);
    }

    AlphaBeta2.prototype = {
        getMove: function(board, cb) {

            var r = this.search(this.player, {board:board},
                                -Infinity, Infinity, this.depth);
            cb(r.move);
        },

        search: function(player, node, achievable, cutoff, depth) {
            var r = this.searchBase(player, node, achievable, cutoff, depth);
            if(false) {
                console.log('search depth: ' + depth + ' returns move: ' +
                            r.move + ' score: ' + r.score);
            }

            return r;
        },

        searchBase: function(player, node, achievable, cutoff, depth) {
            var moves,
                nodes,
                that = this,
                opp = opponent(player),
                s,
                i,
                best;
            if(depth === 0) {
                return node;
            }

            moves = node.board.legalMoves(player);

            if(moves.length === 0) {
                if(node.board.anyLegalMove(opponent(player))) {
                    s = this.search(opponent(player), negateNode(node),
                                    -cutoff, -achievable, depth-1);
                    return {score:-s.score};
                } else {
                    s = node.board.isOver(player).score;
                    return {score:s};
                }
            } else {
                nodes = moves.map(function(move) {
                    var newBoard = node.board.makeMove(move, player);
                    return {move: move,
                            board: newBoard,
                            score: that.fcn(newBoard, player)
                           };
                });

                nodes.sort(function(a, b) { return b.score - a.score; });
                best = {score: achievable, move: 'none'};

                for(i = 0; i < nodes.length; i += 1) {
                    s = that.search(opp, negateNode(nodes[i]),
                                    -cutoff, -best.score,
                                    depth - 1);
                    if(-s.score > best.score) {
                        best = {move: nodes[i].move,
                                score: -s.score};
                    }
                    // if(best.score >= cutoff) {
                    // break;
                    //}
                }

                return best;
            }
        }

    };
    reversi.AlphaBeta2 = AlphaBeta2;

    function AlphaBeta3(depth, fcn) {
        this.depth = depth;
        this.fcn = fcn;
        this.log = [];
        this.cache = {};
    }

    AlphaBeta3.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },

        findMove: function(board) {
            var best;
            this.count = 0;
            this.log = ['starting'];
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
                newDepth,
                hash = board.hash(),
                hashedScore = this.cache[hash];
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
                shuffleArray(moves);
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
                // Order the moves by their score in the cache, if there
                // are any.
                var moveScores = moves.map(function(move) {
                    var newBoard = board.makeMove(move, player),
                        cacheScore = that.cache[newBoard.hash()] || 0;
                    return {move: move,
                            board: newBoard,
                            score: cacheScore};
                });
                // These need to be sorted from smallest to highest,
                // because they represent the opponent score, not the
                // player score.
                moveScores.sort(function(a, b) { return a.score - b.score; });

                newDepth = depth - 1;
                // Simple quiessence search.
                if(moves.length === 1) {
                    newDepth = depth;
                }
                for(i = 0; i < moveScores.length; i += 1) {
                    newBoard = moveScores[i].board;
                    s = that.search(opp, newBoard, -cutoff,
                                    -best.score, depth - 1);
                    if(-s.score > best.score) {
                        best = {
                            score: -s.score,
                            move: moveScores[i].move,
                            child: s
                        };
                    }
                    if(best.score >= cutoff) {
                        break;
                    }
                }
                best.player = player;
                // console.log('hashed score ' + hashedScore + ' new score ' +
                //             best.score + ' ' + hash);
                this.cache[hash] = best.score;
                return best;
            }
        }
    };
    reversi.AlphaBeta3 = AlphaBeta3;


    function AlphaBeta4(maxDepth, fcn) {
        this.maxDepth = maxDepth;
        this.fcn = fcn;
        this.log = [];
        this.cache = {};
    }

    AlphaBeta4.prototype = {
        getMove: function(board, cb) {
            var best = this.findMove(board);
            cb(best.move);
        },

        findMove: function(board) {
            var best, pv;
            this.count = 0;
            this.log = ['starting'];

            pv = null;
            for(var depth = 1; depth <= this.maxDepth; depth += 1) {
                best = this.search(board.player, board, -Infinity, Infinity,
                                   depth, pv);
                console.log('best at depth ' + depth + ' score ' +
                            best.score + ' move ' + best.move);
                pv = best.pv;
            }
            console.log('did ' + this.count + ' calls to search');
            this.log.push('ending score ' + best.score);
            // console.log('best move: ' + best.move + ' score: ' + best.score);
            return best;
        },

        search: function(player, board, achievable, cutoff, depth, pv) {
            var keep = this.log;
            this.log = ['entering, player ' + player +
                         ' depth ' + depth +
                        ' achievable ' + achievable +
                       '  cutoff ' + cutoff];
            var s = this.searchBody(player, board, achievable, cutoff, depth,
                                    pv);
            this.log.push(['exiting score', s]);
            keep.push(this.log);
            this.log = keep;
            return s;
        },

        reorder: function(moves, pv) {
            var N = moves.length, i, v;
            if(pv && pv.length > 0) {
                v = pv[0];
                for(i = 0; i < N; i += 1) {
                    if(moves[i] == v) {
                        moves[i] = moves[0];
                        moves[0] = v;
                        break;
                    }
                }
            }
            return moves;
        },

        searchBody: function(player, board, achievable, cutoff, depth, pv) {
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
                            player: player,
                            pv: null};
                    }
            }

            moves = board.legalMoves(player);

            if(depth === this.depth) {
                // Mix up the order to make the games more unique.
                shuffleArray(moves);
            }


            if(moves.length === 0) {
                if(pv && pv.length) { pv = pv.slice(1); }
                if(board.anyLegalMove(opponent(player))) {
                    s = this.search(opponent(player), board, -cutoff,
                                    -achievable, depth, pv);
                    return {score: -s.score,
                            move: 'no move',
                            child: s,
                            player: player,
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

                newDepth = depth - 1;
                // Simple quiessence search.
                if(moves.length === 1) {
                    newDepth = depth;
                }
                this.reorder(moves, pv);

                if(pv && pv.length) {
                    pv = pv.slice(1);
                }

                for(i = 0; i < moves.length; i += 1) {
                    newBoard = board.makeMove(moves[i], board.player);
                    s = that.search(opp, newBoard, -cutoff,
                                    -best.score, depth - 1, pv);
                    pv = [];
                    if(-s.score > best.score) {
                        best = {
                            score: -s.score,
                            move: moves[i],
                            child: s,
                            pv: [moves[i]].concat(s.pv)
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
    reversi.AlphaBeta4 = AlphaBeta4;



    reversi.UIPlayer = function(color, display) {
        this.display = display;
        this.board = null;
        this.color = color;
    };

    reversi.UIPlayer.prototype = {
        getMove: function(board, cb) {
            var that = this;
            this.display.cb = function(r, c) {
                console.log('row: ' + r + ' col: ' + c);
                that.display.cb = null;
                cb(10 * c + r);
            };
        }
    };


    exports.reversi = reversi;

    (function(exports) {
        var module = exports.bayesLearner = {};

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

        reversi.createBayesFactors = function (weights) {
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
                factors.win[key] = calcTable(wins, weights.winCounts[key]);
                factors.loss[key] = calcTable(losses, weights.lossCounts[key]);
            }

            return factors;

            function calcTable(total, counts) {
                var N = counts.length,
                    i,
                    p,
                    result = {w0: 0,
                              table: []},
                    table = result.table;

                for(i = 0; i < N; i += 1) {
                    p = (counts[i] + alpha) / (total + 2 * alpha);
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
                    i, v,
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
                        result += weights.table[v];
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
                            chunk[features[key][i]] += inc;
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
                            chunk[features[key][i]] += inc;
                        }
                    }
                }
            }

            return weights;
        };


        module.BayesPlayer = function(weights, depth) {
            this.weights = weights || module.createWeights();
            this.factors = [];
            this.depth = depth || 4;
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

            this.searcher = new reversi.AlphaBeta4(this.depth, search);
            this.longSearcher = new reversi.AlphaBeta4(Math.max(this.depth, 8),
                                                       search);
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

                // this.updateFactors();
                endScore = module.scoreFeatures(features, this.factors[moveIndex]);
                if(board.player === 2) { endScore = -endScore; }
                var t = '  ';
                if(score * startScore < 0) { t = '* ';}

                console.log(t + 'start ' + startScore.toFixed(3) + ' end ' +
                            endScore.toFixed(3) + ' diff ' +
                            (endScore  - startScore).toFixed(3) + '  search ' +
                            score.toFixed(3) + ' move ' + board.moveNumber +
                            '  player ' + board.player);
                // console.log('end score: ' + endScore.toFixed(3));
                // console.log('difference ' + (startScore - endScore).toFixed(3));
                // evaluate again (for testing)
                return (endScore - startScore);

            }

        };



    }(reversi));


    (function (module) {
        var logistic = module.logistic = {};
        var learnWeight = 0.03;
        function sigmoid(z) {
            return 1 / (1 + Math.exp(-z));
        }

        logistic.score = function (features, table) {
            var result = table.w0,
                keys = Object.keys(features),
                fidx, key, j, fs, v,
                N = keys.length,
                weights;
            for(fidx = 0; fidx < N; fidx += 1 ) {
                key = keys[fidx];
                weights = table.ws[key];
                fs = features[key];
                for(j = 0; j < fs.length; j += 1) {
                    v = fs[j];
                    result += weights[v];
                }
            }
            return result;
        };

        logistic.update = function(features, table, cost, lambda) {
            var key,
                chunk, i, j,
                inc = -cost * lambda;

            table.w0 += inc;
            for(key in features) {
                chunk = table.ws[key];
                for(i = 0; i < features[key].length; i += 1) {
                    for(j = 0; j < chunk.length; j += 1) {
                        chunk[features[key][j]] += inc;
                    }
                }
            }
        };

        // y is the expected, h is the calculated.

        logistic.cost = function(y, h) {
            // trimmed log
            function tlog(x) {
                return Math.log(Math.max(x, 1e-16));
            }
            var result =  -y * tlog(h) - (1 - y) * tlog(1-h);
            return result;
        };


        logistic.createWeights = function() {
            var weights = {},
                key, i, N, chunk,
                features = reversi.bayesLearner.features;

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
                    w0: 0,
                    ws: {}
                };
                for(key in features) {
                    if(features.hasOwnProperty(key)) {
                        N = Math.pow(3,features[key].size);
                        chunk.ws[key] = zeros(N);
                    }
                }
            }
            return weights;

        };


        logistic.LogitPlayer = function(weights) {
            this.weights = weights || logistic.createWeights();

            var that = this;

            /// TODO: differentiate game ending scores and position
            /// evaluations.
            function search(board) {
                var fs = reversi.bayesLearner.evaluateFeatures(board),
                    weights = that.weights[Math.floor(board.moveNumber / 4)],
                    score = logistic.score(fs, weights);

                if(board.player === 1) {
                    return score;
                } else {
                    return -score;
                }
            }

            this.searcher = new reversi.AlphaBeta(4, search);
            this.longSearcher = new reversi.AlphaBeta(8, search);
        };


        logistic.LogitPlayer.prototype = {
            getMove: function(board, cb) {
                var best;
                best = this.findMove(board);
                cb(best.move);
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

            boardScore: function(board) {
                var moveIndex = Math.floor(board.moveNumber / 4),
                    weights = this.weights[moveIndex],
                    features = reversi.bayesLearner.evaluateFeatures(board),
                    score = logistic.score(features, weights);
                return score;
            },

            learn: function (board, score, alpha) {
                // evaluate current board

                var moveIndex = Math.floor(board.moveNumber / 4),
                    weights = this.weights[moveIndex],
                    features = reversi.bayesLearner.evaluateFeaturesForTraining(
                        board),
                    ssq = 0;
                if(score < 0) {
                    score = -3;
                } else if (score > 0) {
                    score = 3;
                }


                ssq += update(features.normal, score, board.player);
                ssq += update(features.reversed, -score, 3-board.player);

                return ssq;

                function update(features, score, player) {
                    var startScore = logistic.score(features, weights),
                        grad = sigmoid(startScore) - sigmoid(score),
                        endScore;

                    // the score is always returned as the score for the
                    // current player.
                    logistic.update(features, weights, grad, alpha);
                    endScore = logistic.score(features, weights);
                    var t = '  ';
                    if(score * startScore < 0) {
                        t = '* ';
                    }
                    console.log(t + 'start ' + startScore.toFixed(3) + ' end ' +
                                endScore.toFixed(3) + ' search ' +
                                score.toFixed(3) + ' move ' + board.moveNumber +
                                '  player ' + player + ' grad ' + grad.toFixed(3));
                    return Math.abs(grad);
                }

            },

            findMove: function (board) {
                // evaluate current board
                board = board.copy();
                var move;
                if(board.moveNumber > 51) {
                    // Search further out at the end game.
                    move = this.longSearcher.findMove(board);
                } else {
                    move = this.searcher.findMove(board);
                }
                console.log('score ' + move.score.toFixed(3) + ' move ' +
                            board.moveNumber + '  player ' + player);

                return move;
            }
        };

    }(reversi));


    function Train(learner, opponent, display, N, gameCb) {
        this.i = 0;
        this.startTime= new Date();
        var that = this,
            board,
            player = 1;

        function main() {

            if(that.i === N)  { // done!
            } else {
                console.log('starting game');
                board = reversi.getInitialBoard();
                that.startTime = new Date();
                display.board = board;
                display.draw(cb);
            }

            function cb() {
                var move, duration;
                if(board.isOver().over) {
                    that.i += 1;
                    duration = (new Date () - that.startTime) / 1000;


                    console.log('' + that.i + ' of ' + N +
                                ' score for player ' + player + ' ' +
                               board.countDifference(player) + '  took ' +
                                duration);
                    if(gameCb) {
                        gameCb(board);
                        duration = (new Date () - that.startTime) / 1000;
                        console.log('duration after callback: ' + duration);
                    }


                    player = 3 - player;
                    setTimeout(main, 1);
                } else {
                    if(board.player === player) {
                        move = learner.findMove(board);
                    } else {
                        move = opponent.findMove(board);
                    }
                    board = board.makeMove(move.move, move.player);
                    display.board = board;
                    display.draw(cb);
                }
            }
        }
        main();
    }

    exports.reversi.Train = Train;

    function fillRandomGame(N) {
        if(N === undefined) { N = 56; }
        var board = reversi.getInitialBoard(),
            player = reversi.BLACK,
            moves;

        for(var i = 0; i < N; i += 1) {
            moves = board.legalMoves(player);
            if(moves.length > 0) {
                var move = moves[Math.floor(Math.random() * moves.length)];
                board = board.makeMove(move, player);
                if(board.player === null) {
                    // game ended early!
                    return fillRandomGame(N);
                }
                player = board.player;
            }
        }
        return board;
    }
    exports.reversi.fillRandomGame = fillRandomGame;

    function TrainSync(learner, opponent, display, N, gameCb, M) {
        this.startTime= new Date();
        M = M || 0;
        var that = this,
            board,
            player = 1,
            i, move, duration,
            startBoard,
            wins = 0,
            score;


        for(i = 0; i < N; i += 1) {
            if(i % 2 === 0) {
                startBoard = fillRandomGame(M);
            }
            board = startBoard.copy();

            that.startTime = new Date();
            display.board = board;
            display.draw();
            console.log('starting game');
            while(!board.isOver().over) {
                if(board.player === player) {
                    move = learner.findMove(board);
                    console.log('move ' + board.moveNumber +
                                '  player ' + board.player +
                                ' score ' + move.score.toFixed(3));
                } else {
                    move = opponent.findMove(board);
                }
                board = board.makeMove(move.move, move.player);
                display.board = board;
                display.draw();
            }
            duration = (new Date () - that.startTime) / 1000;
            score = board.countDifference(player);
            if(score > 0) {
                wins += 1;
            } else if (score === 0) {
                wins += 0.5;
            }
            console.log('' + (i+1) + ' of ' + N +
                        ' score for player ' + player + ' ' +
                        score + '  took ' +
                        duration + ' wins ' + wins + '/' + (i+1));
            if(gameCb) {
                gameCb(board);
                duration = (new Date () - that.startTime) / 1000;
                console.log('duration after callback: ' + duration);
            }
            player = 3 - player;
        }
        console.log('total wins: ' + wins + ' out of ' + N);
    }
    exports.reversi.TrainSync = TrainSync;

} (typeof exports !== 'undefined' && exports || this));
