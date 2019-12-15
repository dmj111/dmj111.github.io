.. title: Reversi in JavaScript, again
.. tags:
.. date: 2014/02/28 22:42:35

Continuing down the path of mucking with JavaScript, I have ported
Peter Norvig's Reversi code from Lisp to JavaScript.

The code is in a pretty ugly state, but it is running. Besides being
ugly, the code doesn't do any feature detection or graceful
degradation. Though I would like to make it pretty solid, the purpose
of this was to test out JavaScript for algorithmic work, not so much
for the front-end work.  `Check it out here`_.

.. _`Check it out here`: /demos/reversi/

In this version, I have used Dr. Norvig's data structures, but wrapped
it so it can display on an HTML canvas, and a person can play against
it on the canvas.

Some of the stuff going on here is:

- Alpha-Beta_ game tree searching
- Position evaluation using features from Logistello_
- Learning via `Samuel's`_ strategy of using the look-ahead to train
  the evaluation function

  - Using a `Naive Bayes Classifier`_ instead of Logistic Regression

- Some HTML5 stuff, like application caching, and maybe a webworker in
  the future.


.. _`Samuel's`: https://en.wikipedia.org/wiki/Arthur_Samuel
.. _Alpha-Beta: https://en.wikipedia.org/wiki/Alpha-beta_pruning
.. _Logistello: https://skatgame.net/mburo/log.html
.. _`Naive Bayes Classifier`:
       https://en.wikipedia.org/wiki/Naive_Bayes_classifier
