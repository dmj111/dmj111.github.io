/* global window, reversi, reversiLearnerCounts, document */

var reversi = (function(my) {
    'use strict';

    function learningPlayer(depth, random_weight) {
        random_weight = random_weight || 0;
        return new reversi.v2_player.Player(betas, depth, random_weight);

    }

    function buildPlayer(midDepth, random_weight) {
        random_weight = random_weight || 0;
        return new reversi.PhasePlayer([
            [51, learningPlayer(midDepth, random_weight)],
            [61, learningPlayer(8)]
        ]);
    }

    function UI() {
        this.status = document.getElementById('status');
        this.canvas = document.getElementById('board');
        this.move_list = document.getElementById('move_list');
        this.canvas.height = 500;
        this.canvas.width = 500;
        this.board = reversi.getInitialBoard();
        this.display = new reversi.Display(this.canvas, this.board);
        this.player1 = new reversi.UIPlayer(reversi.BLACK, this.display);
        this.player2 = buildPlayer(2, 0.1);

        var node, choices,  i,
            that = this;

        node = document.getElementById('p1');
        choices = node.getElementsByClassName('player');

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

        document.getElementById('control').onclick = function() {
            if(that.isStarted) {
                that.stopGame();
            } else {
                that.startGame();
            }
        };
        this.stopGame();
    }

    UI.prototype = {
        gameOver: function(board) {
            this.stopGame();
            var i, b = 0, w = 0;
            for(i = 0; i < 100; i += 1) {
                if(board.data[i] === reversi.BLACK) {
                    b += 1;
                } else if (board.data[i] === reversi.WHITE) {
                    w += 1;
                }
            }
            var s;
            if(b > w) {
                s = 'Black wins, ' + b + '-' + w;
            } else if (b < w) {
                s = 'White wins, ' + b + '-' + w;
            } else {
                s = 'Tie game, ' + b + '-' + w;
            }
            this.status.innerHTML = s;
        },

        startGame: function() {
            var that = this;
            document.getElementById('control').textContent = 'Stop';
            document.getElementById('players').classList.add('running');

            this.board = reversi.getInitialBoard();
            this.game = new reversi.Game(this.player1, this.player2,
                                         this.display,
                                         x => this.status.textContent = x,
                                         function(board) {
                                             that.gameOver(board);
                                         },
                                         function () {
                                             return !that.isStarted;
                                         }
                                        );
            function to_standard(m) {
                return 'abcdefgh'[Math.floor(m/10-1)] + (m % 10);
            }

            this.game.updateMoves = mvs => {
                // First, add missing moves.
                var elt = document.createElement('pre'),
                    text = [],
                    count = 0,
                    new_moves = [],
                    move_record = [];

                mvs.forEach(m => {
                    if(new_moves.length === 0 ||
                       m[1] !== new_moves[new_moves.length - 1][1]) {
                        new_moves.push(m);
                    } else {
                        new_moves.push(['*', 3 - m[1]]);
                        new_moves.push(m);
                    }
                });

                new_moves.forEach(m => {
                    if (m[1] === 1) {
                        ++count;
                        text.push('\n' + count + '. ');
                    }
                    if(m[0] !== '*') {
                        move_record.push(to_standard(m[0]));
                        text.push(' ' + to_standard(m[0]));
                    } else {
                        text.push('  *');
                    }
                });

                elt.textContent = text.join('');
                elt.textContent += '\n\n' + move_record.join('');
                var div = document.createElement('div');
                div.textContent = "Move record:";

                div.appendChild(elt);
                while(this.move_list.firstChild !== null) {
                    this.move_list.removeChild(this.move_list.firstChild);
                }

                this.move_list.appendChild(div);
            };

            this.status.innerHTML = 'Make a move, or press stop to change settings';
            this.isStarted = true;
            this.game.play();

        },

        selectPlayer: function(playerNumber, player, node) {
            if(!this.isStarted) {
                var root = document.getElementById('p' + playerNumber),
                    choices = root.getElementsByClassName('player'),
                    i, x, newP,
                    pVal;


                if(playerNumber === 1) {
                    pVal = reversi.BLACK;
                } else {
                    pVal = reversi.WHITE;
                }

                // clear the class
                for(i = 0; i < choices.length; i += 1) {
                    choices[i].classList.remove('selected');
                }
                player = player.trim();
                node.classList.add('selected');

                if(player === 'Human') {
                    newP = new reversi.UIPlayer(pVal, this.display);
                } else if(player === 'Level 1') {
                    newP = new reversi.RandomPlayer();
                } else {
                    var depth;
                    if (player === 'Level 2') {
                        depth = 2;
                    } else if (player === 'Level 3') {
                        depth = 4;
                    } else if (player === 'Level 4') {
                        depth = 6;
                    } else {
                        alert('bug');
                    }
                    newP = buildPlayer(depth, 0.1);
                }
                if(playerNumber === 1) {
                    this.player1 = newP;
                } else {
                    this.player2 = newP;
                }
            }
        },

        stopGame: function() {
            this.isStarted = false;
            this.status.innerHTML = 'Change settings or press Start to play';
            document.getElementById('control').textContent = 'Start';
            document.getElementById('players').classList.remove('running');
        }

    };

    my.UI = UI;

    window.addEventListener('load', function() {
        // window.reversi = my.reversi;
        var status = document.getElementById('loadStatus');
        status.style.display = 'none';
        window.UI = new UI();
        window.UI.stopGame();
        window.UI.startGame();
    });

    return my;
}(reversi || {}));
