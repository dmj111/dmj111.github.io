.. title: Tic-tac-toe
.. date: 2019/12/15

.. raw:: html

            <link rel='stylesheet' href='tictactoe.css' type='text/css'>
            <div id='p1' class='pchoice'>
                Player 1
                <div class='choices'>
                    <button type='button' class='btn btn-light player selected'>Human</button>
                    <button type='button' class='btn btn-light player'>Easy</button>
                    <button type='button' class='btn btn-light player'>Medium</button>
                    <button type='button' class='btn btn-light player'>Hard</button>
                    <button type='button' class='btn btn-light player'>Impossible</button>
                </div>
            </div>

            <div id='p2' class='pchoice'>
                Player 2
                <div class='choices'>
                    <button type='button' class='btn btn-light player '>Human</button>
                    <button type='button' class='btn btn-light player'>Easy</button>
                    <button type='button' class='btn btn-light player selected'>Medium</button>
                    <button type='button' class='btn btn-light player'>Hard</button>
                    <button type='button' class='btn btn-light player'>Impossible</button>
                </div>
            </div>
            <div class='h-space'></div>
            <div>
                <button id='start' type='button' class='btn btn-light'>
                    Start
                </button>
                <button id='stop' type='button' class='btn btn-light'>
                    Stop
                </button>

            </div>
            <h3 id='status'></h3>
            <div class='h-space'></div>
            <div id='board'>
                <canvas id='tictacboard' class='board-canvas'
                        width='500' height='500'></canvas>
            </div>
        </div>
        <script type="module">
        import {run} from "./tictactoe.js";
        window.addEventListener('load', run);
        </script>
