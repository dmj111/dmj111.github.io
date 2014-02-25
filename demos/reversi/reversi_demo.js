/* globals reversi */
window.onload = function () {
    var status = document.getElementById('status');
    var canvas = document.getElementById('board');
    canvas.height = 500;
    canvas.width = 500;
    var board = reversi.getInitialBoard();
    canvas.style.background = '#ddc';

    window.display = new reversi.Display(canvas, board);

    window.player1 = new reversi.UIPlayer(reversi.BLACK, window.display);

    window.player2 = new reversi.bayesLearner.BayesPlayer(counts);

    window.game = new reversi.Game(window.player1, window.player2,
                                   window.display, status);
    runGame();

};

function runGame() {
    var status = document.getElementById('status');
    window.game = new reversi.Game(window.player1, window.player2,
                                   window.display, status);
    window.game.play();
}
