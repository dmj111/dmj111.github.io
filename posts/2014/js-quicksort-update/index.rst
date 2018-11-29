.. title: JavaScript QuickSort update
.. tags:
.. date: 2014/04/03 22:19:12

.. |--| unicode:: U+2013   .. en dash
.. |---| unicode:: U+2014  .. em dash, trimming surrounding whitespace
   :trim:
.. |...| unicode:: U+2026  .. ellipsis

The code in `this post`_ was a quicksort that used the less than
operator for comparison.  Here are some times of quicksort using a
comparison function the same way the ``Array.sort`` works.

.. _`this post`: js-quicksort.html

The times are quite a bit slower, and I need to dig into it further.
These are the means of five runs each on one million values.  Some of
the cases (triangular, random) had a very large variation between
runs.

.. csv-table:: Timing results on 1 million values (in seconds)
   :header: data type, qsort2, Array.sort, qsort2cmp

   random double, 0.14, 0.95, 0.38
   sawtooth [1]_, 0.07, 0.06, 0.08
   triangular [2]_, 0.14, 0.71, 0.42
   ordered, 0.03, 0.46, 0.13
   reversed, 0.03, 0.59, 0.10
   shuffled, 0.13, 0.65, 0.28


.. [1] The values in the array are 0, 1, 2, 3, 0, 1, 2, 3, |...| the
       whole way to the end of the array.

.. [2] The value in the array are 0, 1, |...|, N/2-1, N/2, N/2-1,
       |...|, 1,0

What does this tell us?  Not much yet. I have a lot to learn about the
performance of JavaScript engines.
