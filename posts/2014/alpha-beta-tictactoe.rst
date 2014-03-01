.. title: Alpha-Beta Pruning
.. slug:
.. link:
.. description: SEO...
.. tags:
.. date: 2014/03/01 14:04:08

Another page I made to play with is a `Tic-Tac-Toe`_ game.

Originally, I just used the MiniMax_ algorithm for the player.  The
game is a small one, and MiniMax_ can solve the complete game pretty
quickly.

On my very old phone, though, there was a noticeable delay if the game
searched the whole way to the end from the first move.

So, I converted MiniMax to `Alpha-Beta`_.  I always manage to mess
that up on the first try, but eventually got it working.  For a game
like this, the result is still amazing.  With MiniMax, the first move
required about 550,000 searches to get an answer.  With Alpha-Beta,
that is down to less than 20,000.

And now it works fine on my phone.

.. _`Tic-Tac-Toe`: /demos/tictactoe/
.. _`Alpha-Beta` : https://en.wikipedia.org/wiki/Alpha-beta_pruning

.. _MiniMax:
   https://en.wikipedia.org/wiki/Minimax#Minimax_algorithm_with_alternate_moves

.. Delete these comments after running
.. Can add your own meta data too.
.. use TEASER _ END to mark the end of the teaser section
.. add a draft tag to drafts.
