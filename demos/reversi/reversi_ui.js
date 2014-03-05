/* globals reversi, bayesCounts */

var reversiUI = (function() {
    var my = {};
    function UI() {
        this.status = document.getElementById('status');
        this.canvas = document.getElementById('board');
        this.canvas.height = 500;
        this.canvas.width = 500;
        this.board = reversi.getInitialBoard();
        this.display = new reversi.Display(this.canvas, this.board);
        this.player1 = new reversi.UIPlayer(reversi.BLACK, this.display);
        this.player2 = new reversi.bayesLearner.BayesPlayer(bayesCounts, 2);

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

        document.getElementById('start').onclick = function() {
            that.startGame();
        };
        document.getElementById('stop').onclick = function() {
            that.stopGame();
        };

        this.startGame();
    }

    UI.prototype = {
        gameOver: function(board) {
            this.isStarted = false;
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
            this.status.innerText = s;
        },

        startGame: function() {
            var that = this;
            this.board = reversi.getInitialBoard();
            this.game = new reversi.Game(this.player1, this.player2,
                                         this.display, this.status,
                                         function(board) {
                                             that.gameOver(board);
                                         }
                                        );
            this.status.innerText = 'Make a move, or press stop to change settings';
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
                    x = choices[i];
                    x.className = x.className.replace(
                            /(?:^|\s)selected(?!\S)/g , '');

                }

                node.className += ' selected';

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
                    newP = new reversi.bayesLearner.BayesPlayer(bayesCounts,
                                                                depth);
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
            this.status.innerText = 'Change settings or press Start to play';
        }

    };

    my.UI = UI;
    return my;


}());



window.addEventListener('load', function(e) {
    window.UI = new reversiUI.UI();
});
